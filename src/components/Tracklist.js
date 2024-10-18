import React, {useState} from 'react';
import Track from './Track';
import style from './Tracklist.module.css';

export default function Tracklist(props) {

    return(
        <div className={style.container}>
            <h1 className={style.resultTitle}>Results</h1>
            <ul>
                {props.tracklist}
            </ul>
        </div>
    )
}

