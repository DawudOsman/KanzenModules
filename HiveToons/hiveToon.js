// KanzenBundle.htmlparse2
// KanzenBundle.cssSelect
const apiUrl = "https://api.hivetoons.org"
const baseUrl = "https://hivetoons.org/"
const DEFAULT_HEADERS =  {
  "Content-Type": "application/json",
  "Referer": `${baseUrl}/`
};

async function  searchContent(input,page=0) {
    try {
    const url = `${apiUrl}/api/query?searchTerm=${input}&perPage=20&page=${page+1}`
    const response = await fetch(url)
    const dataObj = await response.json()
    const rawResults = dataObj["posts"]
    return rawResults.map(x=>{ return {'title':x['postTitle'],'id': x['slug'],'imageURL': x['featuredImage']} })
    } catch (error) {
    // console.log("Error fetchign Content ")
     console.log(error)   
        return [{'Error': error.message}]
    }

}

async function getContentData(id) {
    try {
        const url = `${baseUrl}series/${id}`
        const response = await fetch(url)
        const text = await response.text()
        const dom = KanzenBundle.htmlparser2.parseDocument(text)
        console.log(text)
        return parseContent(dom)
    } catch (error) {
            return {'Error': err.message}
    }
    
}
async function  getChapters(id) {
      try {
        const url = `${baseUrl}series/${id}`
        const response = await fetch(url)
        const text = await response.text()
        
        const chapterId = parseChapters(text,id)
        console.log(chapterId)
        const newUrl  = `${apiUrl}/api/chapters?postId=${chapterId}&take=900&order=asc`
        const newResponse = await fetch(newUrl)
        const json = await newResponse.json()
        return formatChapters(json["post"]["chapters"])
    } catch (error) {
            return {'Error': error.message}
    }
}
async function getChapterImages(id) {
  try {
    const url = `${apiUrl}/api/chapter?chapterId=${id}`
    const response = await fetch(url)
    const json = await response.json()
    return json['chapter']['images'].map(x=>{ return x['id']})
    
  } catch (error) {console.log(`error fetching images ${id}`)}
}
// util functions
function formatChapters(rawData) 
{
  const chapters = {}
     const chapterArr = {}
     for(let x = 0; x < rawData.length; x = x + 1) {
          const chapterObj = {}
          const chapter = rawData[x]
          chapterObj["id"] = chapter["id"]
          chapterObj["title"] = chapter["title"]
          chapterObj["chapter"] = chapter['number']
          chapterObj['scanlation_group'] = "hiveToons"
          chapterArr[chapter['number']] = [chapterObj]

     }
        chapters["en"] = chapterArr
             for (const key in chapters)
    {
      chapters[key] = Object.entries(chapters[key])
  .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    }
    return chapters
}
function parseChapters(dom,id)
{
  try {
const slug = id; // or from input
const regex = new RegExp(`\\\\"id\\\\":(\\d+),\\\\"slug\\\\":\\\\"${slug}\\\\"`);
const match = dom.match(regex)
if(match){
   chapterId = match[1]
   return chapterId
}
else{
  console.log("failed to match regex")
}
  } catch (error) { console.log(`Error Fetching Chapters ${error}`)}
}
function parseContent(dom){
      contentObj = {}
      try {
        const nodes = KanzenBundle.cssSelect.selectAll('div.desc p, div.entry-content p, div[itemprop=description]', dom)
        const firstElement = nodes[0] 
        const description = getText(firstElement)
        contentObj["description"] = description
      } catch (error) {console.log(`Failed extracting Description ${error}`)}
      try {
         const nodes = KanzenBundle.cssSelect.selectAll(`[itemprop=genre]`,dom)
         const tags = nodes.map(x=>{ return getText(x)})
         contentObj["tags"] = tags
      } catch (error) {console.log(`Failed extracting Genre ${error}`)}
      return contentObj
}
function getText(node) {
  if (!node) return "";
  if (node.type === "text") return node.data;
  if (Array.isArray(node.children)) {
    return node.children.map(getText).join("");
  }
  return "";
}
//test 
//searchContent("lookism").then( x => {getChapters(x[0]['id']).then(x=>{ getChapterImages(x['en'][0][1][0]['id'])})   })