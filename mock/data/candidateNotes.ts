import type { CandidateNote } from '../../src/types/candidate'

export const candidateNotes: CandidateNote[] = [
  {
    id: 1,
    candidateId: 1,
    authorId: 2,
    authorName: '張雅婷',
    content: '電話初篩表現良好，對 Vue 3 生態系相當熟悉，建議安排技術面試。',
    createdAt: '2026-09-22T03:00:00Z',
  },
  {
    id: 2,
    candidateId: 1,
    authorId: 3,
    authorName: '李冠廷',
    content: '希望確認其在大型專案的架構設計經驗。',
    createdAt: '2026-09-24T08:30:00Z',
  },
  {
    id: 3,
    candidateId: 2,
    authorId: 2,
    authorName: '張雅婷',
    content: '候選人目前在職，需提前一個月提出離職，到職日需協調。',
    createdAt: '2026-09-23T06:15:00Z',
  },
]

let nextNoteId = candidateNotes.length + 1

export function nextCandidateNoteId(): number {
  const id = nextNoteId

  nextNoteId += 1

  return id
}
