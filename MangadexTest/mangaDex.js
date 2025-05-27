const apiUrl = "https://api.mangadex.org/"
const baseUrl = "https://allmanga.to"

async function searchContent(input,page=0) {
  try{

    const url = `${apiUrl}/manga?title=${input}&includes[]=cover_art&offset=${page*10 }`
    const response = await fetch(url)
    const json = await response.json()
    const rawArray = json['data']
    const formattedArray = rawArray.map((x)=>{return formatContent(x)})
        console.log(formattedArray)
    return formattedArray
  }
  catch (err)
  {
    return [{'Error': err.message}]
  }

    
}
function formatContent(rawData)
{
  const id = rawData['id']
  var imageURL = `https://mangadex.org/covers/${id}`
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
    
    for (x of rawData['relationships'])
    {
      if ("type" in x  &&  x["type"] == 'cover_art')
        {
          var imageURL = `${imageURL}/${x['attributes']['fileName']}`
        }
    }
    return {'title':title,'id':id,'imageURL':imageURL}

}
