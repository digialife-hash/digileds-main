import Modal from './Modal.jsx'
import Button from './Button.jsx'
export default function ConfirmDialog({ open, title = 'Are you sure?', onConfirm, onClose }) {
  return <Modal open={open} title={title} onClose={onClose}><p className="text-sm text-stone-500 dark:text-slate-400">This action cannot be undone.</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={onConfirm}>Confirm</Button></div></Modal>
}