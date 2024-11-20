/** 
* This script creates a sublist of the tracks that have been 
* add, removed or reordered and parses them to then get return 
* the tracks new locations in the list
* @param {array} originalTrackList - The original array of uri
* @param {array} finalTracklist - The submitted array of uri
*/
 
function makeSubList(originalTrackList, finalTrackList){
    const parsedTrackList = []
    for (let i=0; i<finalTrackList.length; i++){
        let subTrackList = []
        for(let j=0; j<originalTrackList.length; j++){
            if (finalTrackList[i] !== originalTrackList[j]){
                continue
            }

            let k = i
            while(finalTrackList[k] === originalTrackList[j]){
                if (j === originalTrackList.length - 1 || k === finalTrackList.length -1){
                    subTrackList.push(originalTrackList[j])
                    k++
                    break
                }
                subTrackList.push(originalTrackList[j])
                j++
                k++
            }
            i = k - 1
        }
        parsedTrackList.push(subTrackList)
    }
    return parsedTrackList
}

export default function getUpdatedTrackLocations(originalTrackList, finalTrackList) {
    const subList = makeSubList(originalTrackList, finalTrackList)
    const copyTracks = originalTrackList.map(items=>items)
    let insert = 0
    const listToSubmit = subList.map((item, index) =>{
        let start = copyTracks.findIndex((originalItems) => originalItems === item[0])
        let range = item.length
        if (index===0){
            insert = index
        } else {
            insert = insert + subList[index - 1].length
        }
        const movedItems = copyTracks.splice(start,range)
        copyTracks.splice(insert, 0, ...movedItems)
        if( start === insert){
            return null
        }
        return {
            "range_start":start,
            "insert_before":insert,
            "range_length":range
        }

    }
    )
    const final = listToSubmit.filter(item => item !== null)
    return final
}
