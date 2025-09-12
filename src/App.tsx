import './App.less'
import Item from './components/Item'
import Content from './components/Content'
import SearchInput from './components/SearchInput'
import { KruceoDB, Types } from './db/kruceoDB'
import type { Where } from './db/kruceoDB'
import { useEffect, useState } from 'react'
import ConfirmationForm from './components/ConfirmationForm'
import NewContactForm from './components/NewContactForm'

function VoidElement() {
  return <></>
}

export default function App() {

  const db = new KruceoDB("./DB.json")

  db.createTableIfNotExists("contacts", {
    name: Types.string,
    category: Types.number
  })
  db.createTableIfNotExists("contacts-items", {
    contactID: Types.number,
    name: Types.string,
    type: Types.number,
    value: Types.string
  })


  const [data, setData] = useState<ContactWItem[]>([])
  const [search, setSearch] = useState("")

  const [__update, __setUpdate] = useState(false)
  function updateList() {
    __setUpdate(!__update)
  }

  const [DynamicForm, setDynamicForm] = useState(VoidElement)

  const [limit, setLimit] = useState(100)

  const [filterCategory, setFilterCategory] = useState<number>()

  useEffect(() => {
    const where: Where<Contact> = []
    if (search != "") {
      where.push(["name", "ILIKE", search])
    }
    if (search != "" && filterCategory) {
      where.push("&")
    }

    if (filterCategory !== undefined) {
      where.push(["category", "EQ", filterCategory])
    }

    const d = db.read<ContactWItem>('contacts', { limit: limit + 1, where: where, include: [{ tableName: "contacts-items", key: "contactID", compareToKey: 'ID' }] })
    setData(d)
  }, [__update])

  function writeNewContact(contact: Contact, contactItems: ContactItemWithoutContactID[]) {
    const [writedContact] = db.write<Contact>('contacts', [contact])
    const ci: ContactItem[] = contactItems.map(e => ({ ...e, contactID: writedContact.ID }))
    db.write('contacts-items', ci)
  }

  function deleteContact(contact: ContactWItem) {
    if (!contact.ID) throw new Error("no ID provided: " + JSON.stringify(contact))
    db.delete('contacts', [contact.ID])
    const ciIDs = contact['contacts-items'].map(f => f.ID).filter(f => f != undefined)
    db.delete('contacts-items', ciIDs)
  }

  function deleteContactHandler(contact: ContactWItem) {
    setDynamicForm(() =>
      <ConfirmationForm
        onConfirm={() => { deleteContact(contact); setDynamicForm(VoidElement); updateList() }}
        onDecline={() => { setDynamicForm(VoidElement) }}
      />)
  }

  function editContactHandler(originalContact: ContactWItem) {
    setDynamicForm(() => <NewContactForm editThis={originalContact}
      onConfirm={(newC, newCIs) => {
        if (!originalContact.ID) throw new Error("ID not provided: " + JSON.stringify(originalContact))
        db.edit<Contact>('contacts', originalContact.ID, newC)

        const toRemoveCIsIDs: number[] = []
        const toAddCI: ContactItem[] = []
        for (let newCIIndex = 0; newCIIndex < Math.max(originalContact['contacts-items'].length, newCIs.length); newCIIndex++) {

          const newCI = newCIs.at(newCIIndex)
          const originalCI = originalContact['contacts-items'].at(newCIIndex)

          if (originalCI && originalCI.ID && newCI) {
            // update a orignal contact item
            db.edit('contacts-items', originalCI.ID, newCI)
          }
          else if (newCI && !originalCI) {
            // add a new contact item (CI)
            toAddCI.push({ ...newCI, contactID: originalContact.ID })
          }
          else if (!newCI && originalCI && originalCI.ID) {
            // remove a original contact item
            toRemoveCIsIDs.push(originalCI.ID)
          }
        }
        db.delete('contacts-items', toRemoveCIsIDs)
        db.write<ContactItem>('contacts-items', toAddCI)

        setDynamicForm(VoidElement)
        updateList()
      }}
      onDecline={() => setDynamicForm(VoidElement)}
    />);
  }

  return <>
    {DynamicForm}
    <Content>
      {/* <span className="category material-symbols-outlined">group</span> */}
      <div className="sub-bar">
        <SearchInput className='search' onChange={(s) => { setSearch(s); setLimit(100); updateList() }}></SearchInput>
        <label htmlFor="category">
          <select title='Categoria' defaultValue={-1} name="category" id="category" onChange={(e) => { const v = parseInt(e.target.value); setFilterCategory(v != -1 ? v : undefined); updateList() }}>
            <option value="-1">Qualquer</option>
            <option value="0">Desconhecido</option>
            <option value="1">Funcionário</option>
            <option value="2">Cliente</option>
            <option value="3">Fornecedor</option>
            <option value="4">Família</option>
            <option value="5">Amigo</option>
          </select>
        </label>
        <button title='Novo' onClick={() => setDynamicForm(() => <NewContactForm onConfirm={(c, ci) => { writeNewContact(c, ci); setDynamicForm(VoidElement); updateList() }} onDecline={() => setDynamicForm(VoidElement)} />)}>
          <span className="material-symbols-outlined">post_add</span></button>
      </div>

      {data.slice(0, limit).map(c => <Item key={c.ID} contact={c} onEdit={editContactHandler} onDelete={deleteContactHandler} />)}
      {
        data.length > limit ?
          <header className='pagination'>
            <button className='pagination' onClick={() => {
              setLimit(limit + 100);
              updateList()
            }}>...</button>
          </header>
          : null
      }
    </Content>
  </>
}

