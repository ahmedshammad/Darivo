from pathlib import Path
import re,json,gzip
s=Path('/tmp/darivo-home-v14.html').read_text();m=re.search(r'self\.__next_f\.push\((\[1,.*?\])\)</script>',s,re.S);flight=json.loads(m[1])[1]
style=re.search(r'<style[^>]*>(.*?)</style>',s,re.S)[1];css=style[:style.index('.arrival-system')]
start=flight.index('"messages":')+len('"messages":');messages,end=json.JSONDecoder().raw_decode(flight[start:]);messageText=flight[start:start+end]
results=[]
for keep in [2500,3500]:
 for intl in [False,True]:
  replacement=css[-keep:];newflight=flight.replace(css,replacement)
  if intl:newflight=newflight.replace('"messages":'+messageText,'"messages":{}')
  modified=s.replace(css,replacement,1).replace(m[1],json.dumps([1,newflight],ensure_ascii=False,separators=(',',':')))
  dest=f'/tmp/darivo-html-scope-{keep}-intl-{intl}.html';Path(dest).write_text(modified)
  results.append({'path':dest,'retainedCSSRawBytesApprox':keep,'removeLegacyIntlMessages':intl,'rawBytes':len(modified.encode()),'gzipBytes':len(gzip.compress(modified.encode(),compresslevel=6))})
Path('/tmp/darivo-html-scope-bytes.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
