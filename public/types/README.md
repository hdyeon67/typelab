# 캐릭터 에셋 (16종)

행운부적과 동일 방식으로 사용자가 AI 생성한 이미지를 여기에 둔다.

- 파일명: `{코드소문자}.png` (예: `enfp.png`, `intj.png`)
- 규격: 정사각 1024×1024, 크림 배경 + 잉크 외곽선 + 파스텔
- 없어도 앱은 (기질 색 칩 + 동물 이모지 + 캐릭터명) 폴백으로 정상 동작한다(출시 비차단).

## og/ — OG·저장 카드용 축소본

`/api/og`(satori) 가 합성하는 512×512 축소본. 원본 1024²(1.3~1.9MB)를 그대로 쓰면
Workers 에서 매번 fetch·디코드하는 비용이 커서 ~120KB 로 줄여 둔다.
원본을 갈아끼웠으면 아래로 다시 뽑을 것(sharp 는 next 의 전이 의존성):

```
node -e "const sharp=require('sharp'),fs=require('fs'),p=require('path');fs.mkdirSync('public/types/og',{recursive:true});(async()=>{for(const f of fs.readdirSync('public/types').filter(f=>f.endsWith('.png')))await sharp(p.join('public/types',f)).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png({compressionLevel:9,palette:true,quality:90}).toFile(p.join('public/types/og',f))})()"
```

없으면 `/api/og` 는 캐릭터만 빼고 정상 렌더한다(공유·저장이 깨지지 않음).

에셋 생성 프롬프트는 `ai-staff/도담/2026-07-18-typelab-design-plan.md`의 동물별 포즈/소품 매핑 참고.
