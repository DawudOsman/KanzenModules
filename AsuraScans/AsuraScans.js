
// KanzenBundle.htmlparse2
// KanzenBundle.cssSelect
const apiUrl = "https://gg.asuracomic.net/api"
const baseUrl = "https://asuracomic.net"
const DEFAULT_HEADERS =  {
  "Content-Type": "application/json",
  "Referer": `${baseUrl}/`
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




async function  getChapters(id) {
  try {
          const url = `${baseUrl}/${id}`
  const response = await fetch(url)
  const text = await response.text()
  const dom = KanzenBundle.htmlparser2.parseDocument(text)
  const chapters = parsecontentChapters(dom)
  return chapters 
  } catch (err) {
     return {'Error': err.message}
  }
}

async function getChapterImages(id)
{
  try {
              const url = `${baseUrl}/series/${id}`
              console.log(url)
  const response = await fetch(url,DEFAULT_HEADERS)
  var text = await response.text()
   //text = text.replace('"])<\/script><script>self.__next_f.push([1,"', '')
  const dom = KanzenBundle.htmlparser2.parseDocument(text)
 //console.log(text)
  const imgArr = parseChapterImages(dom)
  return imgArr
  
  } catch (e) {
     console.log(e.message)
    return []
  }
}

// util Functions
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

function parsecontentChapters(dom){
   var chaptersNode = KanzenBundle.cssSelect.selectAll("div.scrollbar-thumb-themecolor > div.group",dom)
   const chapters = {}
   const chapterArr = {}
   console.log("Chapter length is")
   console.log(chaptersNode.length)
   chaptersNode = chaptersNode.reverse()
   for(let x = 0; x < chaptersNode.length; x = x + 1){
    
    chapterNode = chaptersNode[x]
    chapterObj = {}
    try {
          const urlNode = KanzenBundle.cssSelect.selectOne("a",chapterNode)
          const url = urlNode?.attribs?.href
          chapterObj["id"] = url
          // title
          const textNode = KanzenBundle.cssSelect.selectOne("h3.text-sm", chapterNode)
          const text = getText(textNode)

          chapterObj["title"] = text
          chapterObj["chapter"] = x+1
          chapterObj['scanlation_group'] = "undefined"
          chapterArr[x+1] = [chapterObj]
    } catch (err) {console.log(`error fetching chapter: ${err}`)}
   }
   chapters["en"] = chapterArr
     for (const key in chapters)
    {
      chapters[key] = Object.entries(chapters[key])
  .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }
   return chapters
}

function parseChapterImages(dom)
{
  try {
    const PageRegex = /\\"pages\\":(\[.*?\])/;
    const scripts = KanzenBundle.cssSelect.selectAll("script", dom)
// Filter those that contain "self.__next_f.push"
const matchedScripts = scripts.filter(node =>
  node.children.some(
    c => c.type === "text" && c.data.includes("self.__next_f.push")
  )
);

// Extract their inner text, then get substring between first and last quote
const scriptData = matchedScripts
  .map(node => {
    const textNode = node.children.find(c => c.type === "text");
    if (!textNode) return "";
    const data = textNode.data;

    // mimic Kotlin's substringAfter("\"").substringBeforeLast("\"")
    const firstQuote = data.indexOf('"');
    const lastQuote = data.lastIndexOf('"');
    if (firstQuote === -1 || lastQuote === -1 || lastQuote <= firstQuote) return "";
    return data.slice(firstQuote + 1, lastQuote);
  })
  .join("");

const regex = /\\"pages\\":(\[.*?\])/;
const match = scriptData.match(regex);

if (match) {
  //console.log("✅ Captured pages array (escaped):", match[1]);
  // Unescape and parse JSON
  const jsonString = match[1].replace(/\\"/g, '"');
  const pages = JSON.parse(jsonString);
  return pages.map(x=>{return x["url"]})
  console.log("✅ Parsed pages:", pages);
} else {
  console.log("❌ No match found");
}
  } catch (e) {console.log(`Error fetching Images through 1st method: ${e}`)}
}

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
//searchContent("a").then(x => { console.log(x[0]) ;getChapters(x[0]["id"]).then(x => { getChapterImages(x["en"][0][1][0]["id"]).then(console.log)})   })