interface Contact { ID?: number, name: string, category: number }
interface ContactItem { ID?: number, name: string, value: string, type: number, contactID: number }
interface ContactItemWithoutContactID { ID?: number, name: string, value: string, type: number }
interface ContactWItem extends Contact {
  "contacts-items": ContactItem[]
}