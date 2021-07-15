export interface ILog {
  api_style: string
  base_url: string
  child_request: boolean
  consumer_id: string
  duration: number
  error_message: string | null
  execution: number
  has_children: boolean
  http_method: string
  id: string
  latency: number
  operation: { id: string; name: string }
  parent_id: string
  path: string
  sandbox: boolean
  service: { id: string; name: string }
  source_ip: string
  status_code: number
  success: boolean
  timestamp: string
  unified_api: string
}
