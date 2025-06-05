const apiUrl = "https://api.mangadex.org/"
const baseUrl = "https://allmanga.to"
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function searchContent(input,page=0) {
  try{

    const url = `${apiUrl}/manga?title=${input}&includes[]=cover_art&includes[]=author&includes[]=artist&includes[]=creator&includes[]=tag&offset=${page*10 }&limit=10`
    const response = await fetch(url)
    const json = await response.json()
    const rawArray = json['data']
    
    
    const formattedArray = rawArray.map((x)=>{return formatContent(x)})
       
    return formattedArray
  }
  catch (err)
  {
    return [{'Error': err.message}]
  }

    
}
async function getContentData(href) {

  try{
    return href
  }
    catch (err)
  {
    return {'Error': err.message}
  }
  
}
async function getChapters(input) {
  var id = input['id']
  var offset = 0
  var limit = 100

  var finished = false
  var chapters = {}
  while (!finished)
  {

   for (let i = 0; i < 3; i++) {
      var url = `${apiUrl}chapter?manga=${id}&limit=${limit}&offset=${offset}&translatedLanguage[]=en&includes[]=scanlation_group&order[chapter]=asc`
     
        var response = await fetch(url)
    var json = await response.json()
    var data = json['data']
        for (x of data)
      {
       
                  if(x['attributes']['translatedLanguage'] && !(x['attributes']['translatedLanguage'] in chapters))
          {
            chapters[x['attributes']['translatedLanguage']] = {}
          }

            if(!(x['attributes']['chapter'] in chapters[x['attributes']['translatedLanguage']]))
              {
                chapters[x['attributes']['translatedLanguage']][x['attributes']['chapter']] = []

              }
              var translationGroup = "undefined"
              for(y of x['relationships'])
                {
                  if(y['type'] == "scanlation_group")
                    {
                      translationGroup = y['attributes']['name']
                    }
                }
                
              chapters[x['attributes']['translatedLanguage']][x['attributes']['chapter']].push({'id':x['id'],'scanlation_group':translationGroup})
          
        
        
      }
      if(data.length == 0){
        finished = true
      }
       offset = offset + limit
}


      await sleep(1000)
      console.log(url)
     
  }
  for (const key in chapters)
    {
      chapters[key] = Object.entries(chapters[key])
  .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }
  return chapters
}
async function getChapterImages(input)
{
  console.log(input)
  try{
    var serverUrl = `https://api.mangadex.org/at-home/server/${input}`
    
    var response = await fetch(serverUrl)
    var json = await response.json()
    var baseUrl = json["baseUrl"]
    var hash = json["chapter"]["hash"]
    var data = json["chapter"]["data"]
    return data.map((x)=>
      {
        return `${baseUrl}/data/${hash}/${x}`
      }
  )
    console.log(json)
  }
  catch(e){
    console.log(e.message)
    return []
  }
}
// util Functions
function formatContent(rawData)
{
  
  var authorArtist = []
  var tags = []
  var imageURL = `https://mangadex.org/covers/${rawData['id']}`
  // get Title
  var title = Object.entries(rawData['attributes']['title'])[0]
  if("en" in rawData['attributes']['title'])
    {
      title = rawData['attributes']['title']['en']
    }
  else if ("ja-ro" in rawData['attributes']['title'])
    {
      title = rawData['attributes']['title']['ja-ro']
    }
  // get Image Url
    if(rawData['attributes'] && rawData['attributes']['tags'])
      {
        for (x of rawData['attributes']['tags'])
          {
            var tagName = Object.entries(x['attributes']['name'])[0]
            if('en' in x['attributes']['name'])
              {
                tagName = x['attributes']['name']['en']
              }
              tags.push(tagName)
          }
      }
    for (x of rawData['relationships'])
    {
      if ("type" in x  &&  x["type"] == 'cover_art')
        {
          var imageURL = `${imageURL}/${x['attributes']['fileName']}`
        }
      if("type" in x && (x['type'] == 'author' ||x['type'] == 'artist'))
        {
          authorArtist.push(x['attributes']['name'])
          //console.log(x)
        }
    }
    // get Description
    
    var description = ""
    if(rawData['attributes']['description']){
          if("en" in rawData['attributes']['description']){
      description = rawData['attributes']['description']['en']
    }
    else if ("ja-ro" in rawData['attributes']['description']){
      description = rawData['attributes']['description']['ja-ro']
    }
    }

   

    const id = {'id':rawData['id'],'description':description,'authorArtist':authorArtist,'tags':tags}
    return {'title':title,'params':id,'imageURL':imageURL}

}
//searchContent("shamo").then((x) => {console.log(x);getChapters(x[0]['params']).then(x => {console.log(x["en"][0][1][0]);getChapterImages(x["en"][0][1][0]["id"]).then(console.log) } )})

