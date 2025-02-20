import { useState } from "react";
import "./SearchInput.less";
export default function (props: { className?: string, onChange: (str: string) => void }) {
    const [value, setValue] = useState("")
    return <form className={props.className} onSubmit={(e) => {
        e.preventDefault()
        props.onChange(value)
    }}>
        <label htmlFor="search" className="search-input">
            <input id="search" name="search" placeholder="Pesquisar" type="text" onChange={(e) => setValue(e.currentTarget.value)} />
            <button className="icon material-symbols-outlined">
                search
            </button>
        </label>
    </form>
}