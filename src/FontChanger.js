const FontChanger = {
    'anger': "Nanum Gothic",
    'disgust': "Nanum Gothic",
    'fear': "Nanum Gothic",
    'happiness': 'Nanum Myengjo',
    'neutral': "Nanum Gothic",
    'sadness': "Nanum Gothic",
    'surprise': "Nanum Gothic",

    stringToDict: function(stringDict){

        let dict = {}
        stringDict = stringDict.replace('{', "")
        let newStringDict = stringDict.replace('}', "")
        let stringArray = newStringDict.split(',');
        stringArray.reduce((i, strData)=> {
            let leftRightArray = strData.split(':')
            let key = leftRightArray[0].replace('\"', "").replace('\"', "")
            dict[key] = parseFloat(leftRightArray[1])
        })
        return dict
    },

    cacluateEmotion: function(stringDict){

        let emotionDict = this.stringToDict(stringDict)

        let sortable = [];
        for (const emotion in emotionDict){
            sortable.push([emotion, emotionDict[emotion]]);
        }

        sortable.sort((a,b) => {
            return b[1] - a[1];
        })
        let font = this[sortable[0][0]]
        console.log(font)
        return font
    }
}

export default FontChanger;