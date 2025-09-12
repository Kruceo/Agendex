import { PropsWithChildren } from "react";
import "./Content.less";


export default function(props:PropsWithChildren){
    return <main className="content-frame">
        {props.children}
    </main>
}

