import React from 'react';
import style from './css_modules/Tracklist.module.css';

export default function Tracklist(props) {

    return(
        <div className={style.container}>
            <h1 className={style.resultTitle}>Results</h1>
            <div className={style.results}>
            <ul>
                {props.tracklist}
            </ul>
            </div>
        </div>
    )
}

