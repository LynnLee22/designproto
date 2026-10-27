import { useMemo, useState } from 'react'

const BANDS = ['3년 이하', '4~6년', '7~10년', '11~15년', '16~20년', '21~30년', '31년 이상']
const DATA = [
  {category:'전체',group:'전체',n:3074,bands:[23.9,18.9,21.1,10.9,9.2,8.9,7],avg:12},
  {category:'성별',group:'남성',n:1616,bands:[25.4,20.3,21.2,10.3,9.7,7.3,5.7],avg:11.1},
  {category:'성별',group:'여성',n:1458,bands:[22.3,17.4,21,11.5,8.7,10.7,8.5],avg:13},
  {category:'연령별',group:'20대 이하',n:183,bands:[70.9,23,6.1,0,0,0,0],avg:3},
  {category:'연령별',group:'30대',n:262,bands:[42.1,27.3,27,3.6,0,0,0],avg:5.2},
  {category:'연령별',group:'40대',n:510,bands:[32.3,19.1,23.3,15.3,8.5,1.4,0],avg:7.9},
  {category:'연령별',group:'50대',n:710,bands:[22.1,23.1,18.9,9.6,10.8,13.8,1.7],avg:11.1},
  {category:'연령별',group:'60대',n:726,bands:[14.6,17.9,24.7,11.8,9.4,8.5,13],avg:14.2},
  {category:'연령별',group:'70대 이상',n:683,bands:[10,11.1,19.9,13.5,13.9,15.6,16],avg:18.7},
  {category:'학력별',group:'중졸 이하',n:472,bands:[4.5,8.1,19,11,19,17.6,20.8],avg:21.5},
  {category:'학력별',group:'고졸 고퇴',n:1571,bands:[19,20,22.4,12.7,8,10.7,7.2],avg:12.5},
  {category:'학력별',group:'대재 이상',n:1031,bands:[40.4,22.1,20.3,8,6.6,2.1,.4],avg:6.9},
  {category:'월평균가구소득',group:'200만원 미만',n:252,bands:[4.1,10.5,22,13.8,20.4,16.5,12.8],avg:19.2},
  {category:'월평균가구소득',group:'200~300만원 미만',n:532,bands:[16.1,18.2,24.1,7.6,11.6,10,12.5],avg:14.9},
  {category:'월평균가구소득',group:'300~400만원 미만',n:766,bands:[24.8,17.6,21.3,12.9,5.2,11,7.1],avg:12},
  {category:'월평균가구소득',group:'400~500만원 미만',n:762,bands:[35.5,18.5,15.4,11,8.3,7.2,4.1],avg:9.9},
  {category:'월평균가구소득',group:'500만원 이상',n:762,bands:[23.5,23.9,24.4,10.1,8.8,5.2,4.3],avg:9.8}
]
type Row = typeof DATA[number]
const categories = ['성별','연령별','학력별','월평균가구소득']
const palettes: Record<string,string[]> = {
  성별:['#9d3855','#d28745'],
  연령별:['#ead1d5','#dcaeb7','#ca8393','#b75e73','#9d3855','#7c203d'],
  학력별:['#e7c7cd','#c77586','#91304d'],
  월평균가구소득:['#ecd4d8','#dda9b3','#ca7d8d','#ae4d65','#852743']
}
const overall=DATA[0]
const fmt=(n:number)=>n.toLocaleString('ko-KR')

function Icon({name}:{name:'book'|'users'|'up'|'down'|'search'|'close'}) {
  const p:Record<string,React.ReactNode>={
    book:<><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v16H7.5A3.5 3.5 0 0 0 4 21.5z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v16h3.5a3.5 3.5 0 0 1 3.5 3.5z"/></>,
    users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    up:<><path d="m18 15-6-6-6 6"/></>, down:<><path d="m6 9 6 6 6-6"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    close:<><path d="m6 6 12 12M18 6 6 18"/></>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{p[name]}</svg>
}

function LineChart({rows,normalized=false}:{rows:Row[],normalized?:boolean}) {
  const [tip,setTip]=useState<{x:number,y:number,row:Row,i:number,v:number}|null>(null)
  const W=760,H=310,L=48,R=16,T=18,B=48
  const max=normalized?1:80
  const values=useMemo(()=>{
    if(!normalized) return rows.map(r=>r.bands)
    return rows.map((r)=>r.bands.map((v,i)=>{
      const col=rows.map(x=>x.bands[i]), lo=Math.min(...col), hi=Math.max(...col)
      return hi===lo?0:(v-lo)/(hi-lo)
    }))
  },[rows,normalized])
  const x=(i:number)=>L+i*(W-L-R)/6, y=(v:number)=>T+(max-v)*(H-T-B)/max
  return <div className="chart-wrap">
    <svg className="line-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={normalized?'정규화 비독서 기간 분포':'비독서 기간 비율 분포'}>
      {[0,.25,.5,.75,1].map((f,i)=><g key={f}><line x1={L} x2={W-R} y1={y(max*f)} y2={y(max*f)} className="grid"/><text x={L-10} y={y(max*f)+4} textAnchor="end">{normalized?(max*f).toFixed(i===0?0:2):max*f}</text></g>)}
      <text x="12" y="12" className="axis-title">{normalized?'정규화 값':'비율 (%)'}</text>
      {BANDS.map((b,i)=><text key={b} x={x(i)} y={H-15} textAnchor="middle">{b}</text>)}
      {rows.map((r,ri)=>{
        const isOverall=r.category==='전체'
        const catRows=DATA.filter(d=>d.category===r.category), color=isOverall?'#98928b':palettes[r.category]?.[catRows.indexOf(r)]||'#9d3855'
        const pts=values[ri].map((v,i)=>`${x(i)},${y(v)}`).join(' ')
        return <g key={r.group}><polyline points={pts} fill="none" stroke={color} strokeWidth={isOverall?2:2.6} strokeDasharray={isOverall?'6 6':''}/>
          {values[ri].map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="4" fill={color} onMouseEnter={()=>setTip({x:x(i),y:y(v),row:r,i,v})} onMouseLeave={()=>setTip(null)}/>)}
        </g>
      })}
    </svg>
    <div className="legend">{rows.map(r=><span key={r.group}><i style={{background:r.category==='전체'?'#98928b':palettes[r.category]?.[DATA.filter(d=>d.category===r.category).indexOf(r)]}}/> {r.group}</span>)}</div>
    {tip&&<div className="tooltip" style={{left:`${tip.x/W*100}%`,top:`${tip.y/H*100}%`}}><b>{tip.row.group}</b><span>{BANDS[tip.i]} · {normalized?tip.v.toFixed(2):`${tip.v}%`}</span><small>사례수 {fmt(tip.row.n)}명</small></div>}
  </div>
}

function Ranking({metric,category}:{metric:string,category:string}) {
  const ix=BANDS.indexOf(metric), unit=metric==='avg'?'년':'%', base=metric==='avg'?overall.avg:overall.bands[ix]
  const rows=DATA.slice(1).filter(r=>category==='전체'||r.category===category).sort((a,b)=>(metric==='avg'?b.avg:b.bands[ix])-(metric==='avg'?a.avg:a.bands[ix]))
  const vals=rows.map(r=>metric==='avg'?r.avg:r.bands[ix]), max=Math.max(...vals,base)*1.12
  return <div className="bars" style={{'--base':`${base/max*100}%`} as React.CSSProperties}>
    <div className="base-line"><span>전체 {base}{unit}</span></div>
    {rows.map((r,i)=>{const v=metric==='avg'?r.avg:r.bands[ix];return <div className="bar-row" key={r.group}><span className="rank">{i+1}</span><span className="bar-label">{r.group}<small>{r.category}</small></span><div className="track"><div className="fill" style={{width:`${v/max*100}%`}}/><b>{v}{unit}</b></div></div>})}
  </div>
}

function Detail({row,onClose}:{row:Row,onClose:()=>void}) {
  return <div className="detail">
    <div className="detail-head"><div><span>{row.category}</span><h3>{row.group}</h3></div><button onClick={onClose} aria-label="상세 닫기"><Icon name="close"/></button></div>
    <div className="detail-stats"><div><span>사례수</span><b>{fmt(row.n)}명</b></div><div><span>평균 기간</span><b>{row.avg}년</b></div></div>
    <h4>기간별 비율 및 전체 대비</h4>
    {BANDS.map((b,i)=>{const diff=row.bands[i]-overall.bands[i];return <div className="mini-row" key={b}><div><span>{b}</span><b>{row.bands[i]}%</b><em className={diff>=0?'positive':''}>{diff>0?'+':''}{diff.toFixed(1)}%p</em></div><div><i style={{width:`${row.bands[i]}%`}}/></div></div>})}
  </div>
}

export default function App() {
  const [category,setCategory]=useState('연령별')
  const [metric,setMetric]=useState('avg')
  const [rankCat,setRankCat]=useState('전체')
  const [query,setQuery]=useState('')
  const [selected,setSelected]=useState<string[]>([])
  const [detail,setDetail]=useState<Row|null>(null)
  const searchRows=DATA.slice(1).filter(r=>(r.group+r.category).includes(query))
  const categoryRows=DATA.filter(r=>r.category===category)
  const lineRows=selected.length?DATA.filter(r=>selected.includes(r.group)):categoryRows
  const longest=DATA.slice(1).reduce((a,b)=>a.avg>b.avg?a:b), shortest=DATA.slice(1).reduce((a,b)=>a.avg<b.avg?a:b)
  const toggle=(g:string)=>setSelected(s=>s.includes(g)?s.filter(x=>x!==g):[...s,g])
  return <main>
    <header><div className="eyebrow"><Icon name="book"/> 2025 독서 지표</div><h1>성인의 비독서 지속 기간</h1><p>책을 읽지 않은 기간을 집단별로 비교하고, 우리 사회의 독서 공백을 살펴봅니다.</p></header>
    <section className="summary">
      <article><span className="card-icon"><Icon name="book"/></span><div><small>전체 평균 비독서 기간</small><b>12<em>년</em></b><p>성인 전체 기준</p></div></article>
      <article><span className="card-icon"><Icon name="users"/></span><div><small>전체 사례수</small><b>{fmt(overall.n)}<em>명</em></b><p>2025년 조사 응답자</p></div></article>
      <article><span className="card-icon peach"><Icon name="up"/></span><div><small>평균이 가장 긴 집단</small><b className="group-value">{longest.group}</b><p>{longest.avg}년 · {longest.category}</p></div></article>
      <article><span className="card-icon pale"><Icon name="down"/></span><div><small>평균이 가장 짧은 집단</small><b className="group-value">{shortest.group}</b><p>{shortest.avg}년 · {shortest.category}</p></div></article>
    </section>

    <section className="workspace">
      <div className="search-box">
        <Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="집단 검색 (예: 30대, 여성, 소득)" aria-label="집단 검색"/>
        {query&&<button onClick={()=>setQuery('')} aria-label="검색어 지우기"><Icon name="close"/></button>}
      </div>
      {query&&<div className="results"><div className="results-head"><b>검색 결과 {searchRows.length}개</b><span>체크하면 그래프에서 비교할 수 있어요</span></div>
        {searchRows.map(r=><div className="result" key={r.group}><label><input type="checkbox" checked={selected.includes(r.group)} onChange={()=>toggle(r.group)}/><span/></label><button onClick={()=>setDetail(r)}><b>{r.group}</b><small>{r.category} · {fmt(r.n)}명</small><em>{r.avg}년</em></button></div>)}
      </div>}
      {selected.length>0&&<div className="selection"><b>선택 비교</b>{selected.map(g=><button key={g} onClick={()=>toggle(g)}>{g} <Icon name="close"/></button>)}<button className="clear" onClick={()=>setSelected([])}>전체 해제</button></div>}
    </section>

    <section className="panel">
      <div className="panel-head"><div><span className="section-no">01</span><h2>비독서 기간 분포</h2><p>{selected.length?'선택한 집단을 겹쳐 비교합니다.':'분류별 집단의 실제 비율을 비교합니다.'}</p></div></div>
      {!selected.length&&<nav className="tabs">{categories.map(c=><button className={c===category?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</nav>}
      <LineChart rows={[overall,...lineRows]}/>
    </section>

    <section className="panel">
      <div className="panel-head split"><div><span className="section-no">02</span><h2>집단 순위</h2><p>선택 지표가 높은 순서로 보여줍니다.</p></div><div className="controls">
        <label>지표<select value={metric} onChange={e=>setMetric(e.target.value)}><option value="avg">평균 비독서 기간 (년)</option>{BANDS.map(b=><option key={b}>{b}</option>)}</select></label>
        <label>분류<select value={rankCat} onChange={e=>setRankCat(e.target.value)}><option value="전체">전체 분류 보기</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      </div></div>
      <Ranking metric={metric} category={rankCat}/>
    </section>

    <section className="panel">
      <div className="panel-head"><div><span className="section-no">03</span><h2>분류 내 상대 분포</h2><p>같은 분류 안에서 상대적으로 어느 집단이 높은지만 보여주며, 실제 비율 크기는 01 그래프를 참고하세요.</p></div></div>
      <nav className="tabs">{categories.map(c=><button className={c===category?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</nav>
      <LineChart rows={categoryRows} normalized/>
    </section>
    <footer><Icon name="book"/><span>자료: 통계청 KOSIS, 성인의 비독서 지속 기간(2025)</span></footer>
    {detail&&<><button className="backdrop" onClick={()=>setDetail(null)} aria-label="상세 닫기"/><aside><Detail row={detail} onClose={()=>setDetail(null)}/></aside></>}
  </main>
}
