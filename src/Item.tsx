import './Item.less';

export default function (props: { contact: ContactWItem, onEdit?: (cnt: ContactWItem) => void, onDelete?: (cnt: ContactWItem) => void }) {
    return <div className='contact-item' tabIndex={0} onFocus={() => console.log(1)}>
        <header>
            <h3>{props.contact.name}</h3>
            <span className="category material-symbols-outlined" title={convertCategoryID(props.contact.category)}>
                {convertCategory2Icon(props.contact.category)}
            </span>
        </header>
        <section>
            <ul>
                {
                    props.contact['contacts-items'].map(m => {
                        return <li key={m.ID}>
                            <strong>{m.name}: </strong>{m.value}
                        </li>
                    })
                }
            </ul>
            <div className='options'>
                <button onClick={() => props.onEdit ? props.onEdit(props.contact) : null} className='material-symbols-outlined'>edit</button>
                <button onClick={() => props.onDelete ? props.onDelete(props.contact) : null} className='delete'><span className="material-symbols-outlined">delete</span></button>
            </div>
        </section>
    </div>
}

function convertCategoryID(id: number) {
    switch (id) {
        case 1:
            return "funcionário"
            break;

        case 2:
            return "cliente"
            break;
        case 3:
            return "fornecedor"
            break;
        case 4:
            return "família"
            break;
        case 5:
            return "amigo"
            break;
        default:
            return "desconhecido"
            break;
    }
}


function convertCategory2Icon(id: number) {
    switch (id) {
        case 1:
            return "work"
            break;

        case 2:
            return "shopping_bag"
            break;
        case 3:
            return "factory"
            break;
        case 4:
            return "family_restroom"
            break;
        case 5:
            return "group"
            break;
        default:
            return "person"
            break;
    }
}