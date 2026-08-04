import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { useRouteAuth } from '@/contexts/RouteAuthContext'
import { usePlayer } from '@/contexts/PlayerContext'

interface InitModalProps {
  onClose: () => void
}

export function InitModal({ onClose }: InitModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const { player } = usePlayer()
  const [routeNumber, setRouteNumber] = useState('')
  const [routeTitle, setRouteTitle] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  )
  const { routeAuth, submitRouteAuth, deleteRouteAuth } = useRouteAuth()

  const onSumbit = () => {
    submitRouteAuth(routeTitle, routeNumber, player.id)
  }

  const onDelete = () => {
    if (routeAuth.id == null) return;

    deleteRouteAuth(routeAuth.id);
    onClose();
  }

  return (
    <Modal onClose={onClose} >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col gap-4 w-full h-full"
        style={{ width: 900 }}
      >
        {step === 1 ? (
          <Guide onClose={onClose} onNext={() => setStep(2)} />
        ) : routeAuth?.id == null ? (
          <Authentication
            routeNumber={routeNumber}
            routeTitle={routeTitle}
            onChangeRouteNumber={setRouteNumber}
            onPrev={() => setStep(1)}
            onConfirm={onSumbit}
          />
        ) : (
          <Duplicate onClose={onClose} onDelete={onDelete} />
        )}
      </div>
    </Modal>
  )
}

interface GuideProps {
  onClose: () => void
  onNext: () => void
}

function Guide({ onClose, onNext }: GuideProps) {
  return (
    <>
      <h2 className="text-xl font-bold text-white">통계 초기화 전 안내</h2>
      <ul className="flex flex-col gap-2 text-sm text-gray-200 bg-gray-900/50 border border-gray-700 rounded-md p-4 list-disc list-inside leading-relaxed">
        <li>초기화 시 <span className="text-red-400 font-semibold">해당 닉네임의 기존 통계 데이터가 모두 삭제</span>됩니다.</li>
        <li>닉네임 변경 후에는 이전 사용자의 데이터가 섞여 있을 수 있으므로, 정확한 통계를 위해 초기화를 권장합니다.</li>
        <li>초기화 후 최근 <span className="text-white font-semibold">90일</span> 이내 전적을 기준으로 통계가 새로 계산됩니다.</li>
      </ul>
      <div className="flex justify-end gap-2 mt-auto">
        <Button variant="ghost" onClick={onClose} className="text-sm text-white">
          닫기
        </Button>
        <Button variant="secondary" onClick={onNext} className="text-sm">
          다음
        </Button>
      </div>
    </>
  )
}

interface AuthenticationProps {
  routeNumber: string
  routeTitle: string
  onChangeRouteNumber: (value: string) => void
  onPrev: () => void
  onConfirm: () => void
}

function Authentication({ routeNumber, routeTitle, onChangeRouteNumber, onPrev, onConfirm }: AuthenticationProps) {
  return (
    <>
      <h2 className="text-xl font-bold text-white">본인 확인</h2>
      <ul className="flex flex-col gap-2 text-sm text-gray-200 bg-gray-900/50 border border-gray-700 rounded-md p-4 list-disc list-inside leading-relaxed">
        <li>본인 확인을 위해 루트명을 <span className="text-red-300 font-semibold">{routeTitle}</span>로 생성한 루트의 루트번호를 입력해 주세요.</li>
        <li>타인에 의한 무단 초기화를 방지하기 위한 닉네임 확인 절차로, 해당 루트의 <span className="text-white font-semibold">생성자 명과 지정된 루트명</span>이 같아야 합니다. </li>
        <li>루트번호 입력 후 최대 <span className="text-blue-400 font-semibold">10분</span> 후 초기화됩니다.</li>
      </ul>
      <div className="flex flex-col gap-2">
        <label htmlFor="route-number" className="text-sm text-gray-200 font-semibold">
          루트번호
        </label>
        <input
          id="route-number"
          type="text"
          value={routeNumber}
          onChange={(e) => onChangeRouteNumber(e.target.value)}
          placeholder="루트번호를 입력하세요"
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-2 mt-auto">
        <Button variant="ghost" onClick={onPrev} className="text-sm text-white">
          이전
        </Button>
        <Button
          variant="secondary"
          onClick={onConfirm}
          disabled={!routeNumber.trim()}
          className="text-sm"
        >
          초기화
        </Button>
      </div>
    </>
  )
}

interface DuplicateProps {
  onClose: () => void
  onDelete: () => void
}

function Duplicate({ onClose, onDelete }: DuplicateProps) {
  const { routeAuth } = useRouteAuth()

  return (
    <>
      <h2 className="text-xl font-bold text-white">초기화 요청 등록 완료</h2>
      <ul className="flex flex-col gap-2 text-sm text-gray-200 bg-gray-900/50 border border-gray-700 rounded-md p-4 list-disc list-inside leading-relaxed">
        <li>본인 확인 요청이 등록되어 있습니다.</li>
        <li>등록한 루트명: <span className="text-red-300 font-semibold">{routeAuth?.title ?? '-'}</span> / 루트번호: <span className="text-white font-semibold">{routeAuth?.routeId ?? '-'}</span></li>
        <li>최대 <span className="text-blue-400 font-semibold">10분</span> 이내 본인 확인이 완료되면 자동으로 초기화가 진행됩니다.</li>
        <li>잘못 등록했다면 <span className="text-red-400 font-semibold">요청 취소</span> 후 다시 등록해 주세요.</li>
      </ul>
      <div className="flex justify-end gap-2 mt-auto">
        <Button variant="ghost" onClick={onClose} className="text-sm text-white">
          닫기
        </Button>
        <Button variant="secondary" onClick={onDelete} className="text-sm">
          요청 취소
        </Button>
      </div>
    </>
  )
}
