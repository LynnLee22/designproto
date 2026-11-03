"""Read numeric angle lines from Arduino and insert them into Supabase.

Run with: python upload.py [--port /dev/cu.usbmodemXXXX]
The .env file must define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
"""

from __future__ import annotations

import argparse
import math
import os
import queue
import re
import sys
import threading
import time
from typing import Optional

import serial
from serial.tools import list_ports
from dotenv import load_dotenv
from supabase import Client, create_client

BAUD_RATE = 9600
TABLE_NAME = "Reading"
BATCH_INTERVAL = 0.03
MAX_BATCH_SIZE = 25


def choose_port(requested_port: Optional[str]) -> str:
    if requested_port:
        return requested_port

    ports = list(list_ports.comports())
    if not ports:
        raise RuntimeError(
            "시리얼 포트를 찾을 수 없습니다. Arduino를 연결하거나 --port로 지정하세요."
        )
    if len(ports) == 1:
        return ports[0].device

    print("사용 가능한 시리얼 포트:")
    for index, port in enumerate(ports, start=1):
        description = port.description or "설명 없음"
        print(f"  {index}. {port.device} ({description})")

    while True:
        selection = input("연결할 포트 번호를 선택하세요: ").strip()
        try:
            index = int(selection)
        except ValueError:
            print("번호를 입력하세요.")
            continue
        if 1 <= index <= len(ports):
            return ports[index - 1].device
        print(f"1부터 {len(ports)} 사이의 번호를 입력하세요.")


def create_supabase_client() -> Client:
    load_dotenv()
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError(
            ".env에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정하세요."
        )
    return create_client(url, key)


def parse_value(line: str) -> Optional[float]:
    text = line.strip()
    if not text:
        return None

    try:
        value = float(text)
    except ValueError:
        match = re.search(
            r"([-+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:°|도|deg(?:rees?)?)?\s*$",
            text,
            re.IGNORECASE,
        )
        if not match:
            return None
        value = float(match.group(1))

    return value if math.isfinite(value) else None


def upload_batches(
    client: Client,
    pending_values: queue.Queue,
    stop_event: threading.Event,
) -> None:
    while not stop_event.is_set() or not pending_values.empty():
        try:
            batch = [pending_values.get(timeout=BATCH_INTERVAL)]
        except queue.Empty:
            continue

        deadline = time.monotonic() + BATCH_INTERVAL
        while len(batch) < MAX_BATCH_SIZE and not stop_event.is_set():
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            try:
                batch.append(pending_values.get(timeout=remaining))
            except queue.Empty:
                break

        try:
            rows = [{"value": value} for value in batch]
            client.table(TABLE_NAME).insert(rows).execute()
            print(f"저장 완료: {len(batch)}개 · 최신 값 {batch[-1]}", flush=True)
        except Exception as error:
            print(
                f"Supabase 저장 실패 ({len(batch)}개, 최신 값 {batch[-1]}): {error}",
                file=sys.stderr,
                flush=True,
            )


def upload_lines(port_name: str, client: Client) -> None:
    print(
        f"{port_name}에 {BAUD_RATE} baud로 연결합니다. 종료하려면 Ctrl+C를 누르세요.",
        flush=True,
    )
    pending_values = queue.Queue()
    stop_event = threading.Event()
    uploader = threading.Thread(
        target=upload_batches,
        args=(client, pending_values, stop_event),
        name="supabase-uploader",
        daemon=True,
    )
    uploader.start()

    try:
        with serial.Serial(port_name, BAUD_RATE, timeout=1) as device:
            last_input_at = time.monotonic()
            last_wait_notice_at = last_input_at
            while True:
                raw_line = device.readline()
                if not raw_line:
                    now = time.monotonic()
                    if now - last_input_at >= 3 and now - last_wait_notice_at >= 3:
                        print(
                            "시리얼 데이터 대기 중: 3초 동안 새 줄이 없습니다. Arduino 전원, 스케치, USB 포트를 확인하세요.",
                            flush=True,
                        )
                        last_wait_notice_at = now
                    continue

                last_input_at = time.monotonic()
                line = raw_line.decode("utf-8", errors="replace").strip()
                value = parse_value(line)
                if value is None:
                    if line:
                        print(f"숫자 값이 아니어서 건너뜀: {line}", flush=True)
                    continue

                pending_values.put(value)
                print(f"수신: {value}", flush=True)
    finally:
        stop_event.set()
        uploader.join(timeout=10)
        if uploader.is_alive():
            print("Supabase 업로드가 아직 진행 중입니다.", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Arduino 시리얼 값을 Supabase Reading 테이블에 저장합니다."
    )
    parser.add_argument(
        "--port",
        help="시리얼 포트 경로 (생략하면 포트를 검색하거나 선택합니다)",
    )
    args = parser.parse_args()

    try:
        port_name = choose_port(args.port)
        client = create_supabase_client()
        upload_lines(port_name, client)
    except KeyboardInterrupt:
        print("\n업로드를 종료했습니다.")
    except Exception as error:
        print(f"오류: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
