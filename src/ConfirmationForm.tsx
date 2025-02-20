import "./ConfirmationForm.less";
export default function ConfirmationForm(props: { onConfirm: () => void, onDecline: () => void }) {
    return <div className="confirmation-form-frame">
        <form className="confirmation-form" action={""} onSubmit={(e) => e.preventDefault()}>
            <p>Tem certeza?</p>
            <div className="bottom-bar">
                <button onClick={props.onDecline}>Não</button>
                <button onClick={props.onConfirm}>Sim</button>
            </div>
        </form>
    </div>
}