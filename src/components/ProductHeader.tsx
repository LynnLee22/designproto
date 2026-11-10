import { useEffect } from "react"
import { IS_DEMO_MODE } from "../lib/supabase"
import { PRODUCT } from "../product"

const slots = {
  name: "[제품 이름]",
  concept: "[제품 컨셉, 한 줄]",
  description: "[제품 설명, 2~3문장]",
}

export default function ProductHeader() {
  useEffect(() => {
    document.title = PRODUCT.name
  }, [])

  return (
    <header className="product-header">
      <h1 className={`t-display ${PRODUCT.name ? "" : "is-placeholder"}`}>
        {PRODUCT.name || slots.name}
      </h1>
      <p
        className={`t-label product-concept ${
          PRODUCT.concept ? "" : "is-placeholder"
        }`}
      >
        {PRODUCT.concept || slots.concept}
      </p>
      <p
        className={`t-body product-description ${
          PRODUCT.description ? "" : "is-placeholder"
        }`}
      >
        {PRODUCT.description || slots.description}
      </p>
      {IS_DEMO_MODE && (
        <p className="t-caption demo-note">데모 데이터로 표시 중</p>
      )}
    </header>
  )
}
