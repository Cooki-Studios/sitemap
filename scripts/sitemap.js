const xml = [
    {contents:'<?xml version="1.0" encoding="UTF-8"?>\n\n'},
    {contents:'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'},
    {contents:'</urlset>'},
]

let xmlFull = "";

function download(contents) {
    xmlFull = "";
    for (let i = 0; i < xml.length; i++) {
        xmlFull += xml[i].contents;
    }

    let dl = document.createElement("a");
    dl.download = "sitemap.xml";
    dl.href = "data:text/plain;utf-8,"+encodeURIComponent(xmlFull);
    dl.click();
}

function ghFetchTime(repoContents,repo) {
    xml.splice(2,0,{contents:'   <url>\n'});

    switch (repo) {
        case "cooki-studios.github.io":
            xml.splice(3,0,{contents:'      <loc>https://cookistudios.com/</loc>\n'});
            break;
        default:
            xml.splice(3,0,{contents:'      <loc>https://'+"test."+'cookistudios.com/</loc>\n'});
            break;
    }

    xml.splice(4,0,{contents:'      <lastmod>'+JSON.parse(repoContents).data[0].commit.committer.date.split('T')[0]+'</lastmod>\n'});
    xml.splice(5,0,{contents:'      <priority>0.8</priority>\n'});
    xml.splice(6,0,{contents:'   </url>\n'});
    download(JSON.stringify(xml));
}