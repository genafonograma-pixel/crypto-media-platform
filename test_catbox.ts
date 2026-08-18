import fs from 'fs';

async function testCatbox() {
  const buffer = fs.readFileSync('/Users/luka/.gemini/antigravity/brain/58be39b4-430f-4b5d-9927-a3e8c2d9830e/media__1786536175486.png');
  const blob = new Blob([buffer], { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, 'image.png');
  
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });
  
  const text = await res.text();
  console.log(res.status, text);
}

testCatbox().catch(console.error);
