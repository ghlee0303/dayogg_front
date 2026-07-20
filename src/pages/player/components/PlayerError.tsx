import { ApiError } from "@/utils/api"

interface PlayerErrorProps {
  apiError: ApiError | null
}

export function PlayerError({ apiError }: PlayerErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img src="/img/adina_error.webp" alt="not found" className="w-40 h-40 object-contain" />

      <div className="flex flex-col items-center justify-center mt-5">

        <p className="text-white text-lg font-semibold">{apiError?.message ?? ""}</p>
      </div>
    </div>
  )
}