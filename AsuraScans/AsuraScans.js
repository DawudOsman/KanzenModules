
// KanzenBundle.htmlparse2
// KanzenBundle.cssSelect
const apiUrl = "https://gg.asuracomic.net/api"
const baseUrl = "https://asuracomic.net"
const DEFAULT_HEADERS =  {
  "Content-Type": "application/json",
};
async function searchContent(input,page=0){
  try{
         const response = await fetch(`${baseUrl}/series?name=${input}&page=${page+1}`)
     const text = await response.text()
     return parsesearchText(text)
  }
  catch (err)
  {
        return [{'Error': err.message}]
  }

     
}
function parsesearchText(input){
  const dom =  KanzenBundle.htmlparser2.parseDocument(input);
  const links = KanzenBundle.cssSelect.selectAll("div.grid > a[href]", dom)
  const arr = []
  for (el of links)
    {
        const href = el.attribs?.href;
        //console.log(href)
        // imageUrl
        const imgNode = KanzenBundle.cssSelect.selectOne("img",el)
        const cover = imgNode?.attribs?.src
        //console.log(cover)
        // title
        const titleNode = KanzenBundle.cssSelect.selectOne("div.block > span.block",el)
        const title = getText(titleNode)
        //console.log(title)

         arr.push({'title':title,'id': href,'imageURL': cover})
    }
    return arr
}


async function getContentData(id)
{
  try {
      const url = `${baseUrl}/${id}`
  const response = await fetch(url)
  const text = await response.text()
  const dom = KanzenBundle.htmlparser2.parseDocument(text)
  return parseContentData(dom)
  } catch (error) {
        return {'Error': err.message}
  }

  
 
}

function parseContentData(dom)
{
     contentObj = {}
     authorArtist = []
     genres = []
     // description
     try{
        const descriptionNode = KanzenBundle.cssSelect.selectOne("span.font-medium.text-sm",dom)
        const description = getText(descriptionNode)
        contentObj['description'] = description
     }catch(e){console.log(`Error fetching description: ${e}`)}
     // author
     try{
        const parentDiv = KanzenBundle.cssSelect.selectAll("div:has(h3)", dom);
        const filteredDiv =  parentDiv.filter(div => {
          const h3s = div.children.filter(c => c.type === "tag" && c.name === "h3");
          if (h3s.length === 0) return false;
          const firstH3Text = getText(h3s[0]).trim();
          return (firstH3Text.includes("Artist") || firstH3Text.includes("Author") ); // containsOwn equivalent
        });
        const result = filteredDiv.map(div => {
            const h3s = div.children.filter(c => c.type === "tag" && c.name === "h3");
            return h3s[1] ? getText(h3s[1]).trim() : null;
          }).filter(Boolean);
        if (result.length > 0)
          {
             contentObj["authorArtist"] = result
          }

     }catch(e){console.log(`Error fetching author/artist: ${e}`)}
     // genre
     try {
       const genreNodes = KanzenBundle.cssSelect.selectAll("div[class^=space] > div.flex > button.text-white",dom)
       for(genreNode of genreNodes)
        {
          const genre = getText(genreNode)
          genres.push(genre)
        }
     } catch (e) {console.log(`Error fetching Genres: ${e}`)}

    if(genres.length > 0)
      {
        contentObj["tags"] = genres
      }
     return contentObj

}

// util Functions


function getText(node) {
  if (!node) return "";
  if (node.type === "text") return node.data;
  if (Array.isArray(node.children)) {
    return node.children.map(getText).join("");
  }
  return "";
}

// test
//searchContent("a").then(x => { console.log(x[0]) ;getContentData(x[0]["id"]).then(console.log)   })