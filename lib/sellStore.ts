/**
 * 상품 등록 플로우에서 페이지 간 데이터를 유지하는 클라이언트 전용 스토어.
 * 브라우저 메모리에만 존재하며 탭을 닫으면 초기화됩니다.
 */
export const sellStore: {
  files: File[]
  sport: string
  productType: string
  formData: Record<string, string>  // fieldId → value
  level: string
  analysisResult: Record<string, unknown> | null
  compressedImages: { data: string; mediaType: string }[]
} = {
  files: [],
  sport: '',
  productType: '',
  formData: {},
  level: '',
  analysisResult: null,
  compressedImages: [],
}
