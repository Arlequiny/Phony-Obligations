import "./UIModal.css";

export default function UIModal({ title, onClose, children }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="btn-close" onClick={onClose}>✖</button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
}