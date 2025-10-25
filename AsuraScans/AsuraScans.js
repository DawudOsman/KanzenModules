
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


function getText(node) {
  if (!node) return "";
  if (node.type === "text") return node.data;
  if (Array.isArray(node.children)) {
    return node.children.map(getText).join("");
  }
  return "";
}

// test
//searchContent("a").then(console.log)