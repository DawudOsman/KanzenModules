const apiUrl = "https://api.mangadex.org/"
const baseUrl = "https://allmanga.to"

async function searchContent(input,page=0) {
  try{

    const url = `${apiUrl}/manga?title=${input}&includes[]=cover_art&includes[]=author&includes[]=artist&includes[]=creator&includes[]=tag&offset=${page*10 }`
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
    return {'title':title,'id':id,'imageURL':imageURL}

}

