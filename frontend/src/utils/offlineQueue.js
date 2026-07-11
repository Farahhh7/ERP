// utils/offlineQueue.js — b IndexedDB (via idb-keyval ya localforage)
import { get, set } from 'idb-keyval'

export async function queueStockMovement(movement) {
  const queue = (await get('pending-movements')) || []
  queue.push({ ...movement, timestamp: Date.now(), synced: false })
  await set('pending-movements', queue)
}

export async function syncPendingMovements(apiCall) {
  const queue = (await get('pending-movements')) || []
  const remaining = []
  for (const m of queue) {
    try {
      await apiCall(m)
    } catch {
      remaining.push(m) // fail? y39ed fel queue
    }
  }
  await set('pending-movements', remaining)
}