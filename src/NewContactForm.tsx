import { FormEvent, useState } from "react";
import "./NewContactForm.less";
export default function NewContactForm(props: { onConfirm: (contact: Contact, contactItems: ContactItemWithoutContactID[]) => void, onDecline: () => void, editThis?: ContactWItem }) {

    const [contactCount, setContactCount] = useState(props.editThis?.["contacts-items"].length ?? 1)

    function onSubmitHandler(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const name = data.get("name")
        const category = data.get("category")
        const d = data.getAll("item-name")
        const a = data.getAll("item-value")

        if (!name || !category || d.length == 0 || a.length == 0 || d.length != a.length) {
            throw new Error(`problem with form data:\n${name}\n${category}\n${d.toString()}\n${a.toString()}`)
        }
        let contact: Contact = { ID: props.editThis?.ID, category: parseInt(category.toString()), name: name.toString() }
        let contactsItems: ContactItemWithoutContactID[] = []
        for (const index in d) {
            contactsItems.push({ name: d[index].toString(), value: a[index].toString(), type: a[index].toString().includes("@") ? 1 : 0 })
        }

        props.onConfirm(contact, contactsItems)
    }

    return <div className="form-frame">
        <form className="new-contact-form" action={""} onSubmit={onSubmitHandler}>
            {/* <p>Tem certeza?</p> */}
            <div className="contact">
                <h3>Credenciais</h3>
                <div className="item">
                    <input autoFocus required name="name" id="name" type="text" placeholder="Nome" defaultValue={props.editThis?.name} />
                    <select required name="category" id="category" defaultValue={props.editThis?.category}>
                        <option value="1">Desconhecido</option>
                        <option value="1">Funcionário</option>
                        <option value="2">Cliente</option>
                        <option value="3">Fornecedor</option>
                        <option value="4">Família</option>
                        <option value="5">Amigo</option>
                    </select>
                </div>
            </div>
            <div className="contact-items">
                <header className="header">
                    <h3>Contatos</h3>
                    <div>
                        <span tabIndex={0} onKeyDown={(e => e.key == "Enter" && contactCount > 1 ? setContactCount(contactCount - 1): null)} onClick={() => contactCount > 1 ? setContactCount(contactCount - 1) : null}>-</span>
                        <span tabIndex={0} onKeyDown={(e => e.key == "Enter" ?setContactCount(contactCount + 1): null)} onClick={() => setContactCount(contactCount + 1)}>+</span>
                    </div>
                </header>
                <div className="items">

                    {
                        contactCount > 0 ?
                            " ,".repeat(contactCount - 1).split(",").map((_, i) =>
                                <div className="item" key={i}>
                                    <input required name="item-name" type="text" placeholder="Nome do Contato" defaultValue={props.editThis?.["contacts-items"].at(i)?.name} />
                                    <input required name="item-value" type="text" placeholder="Numero ou Email" defaultValue={props.editThis?.["contacts-items"].at(i)?.value} />
                                </div>
                            )
                            : null
                    }
                </div>
            </div>
            <div className="bottom-bar">
                <button className="cancel" onClick={(e) => { e.preventDefault(); props.onDecline() }}>Cancelar</button>
                <button className="finish">Concluir</button>
            </div>
        </form>
    </div>
}