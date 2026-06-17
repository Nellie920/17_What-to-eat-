// Helper to get character image URL based on environment (Flask vs Local File)
function getCharacterImageUrl(key) {
    const charMap = {
        'A1': 'm1', 'A2': 'm2', 'A3': 'm3',
        'B1': 'f1', 'B2': 'f2', 'B3': 'f3',
        'm1': 'm1', 'm2': 'm2', 'm3': 'm3',
        'f1': 'f1', 'f2': 'f2', 'f3': 'f3'
    };
    const mapped = charMap[key] || key;
    return `app/static/images/characters/${mapped}.png`;
}

// Character Data (for Selection Screen)
const charactersData = window.charactersData || {
    male: [
        { id: 'A1', name: '洛頁彥', get icon() { return `<img src="${getCharacterImageUrl('m1')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="洛頁彥">`; } },
        { id: 'A2', name: '齊勻楠', get icon() { return `<img src="${getCharacterImageUrl('m2')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="齊勻楠">`; } },
        { id: 'A3', name: '秦陌寂', get icon() { return `<img src="${getCharacterImageUrl('m3')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="秦陌寂">`; } }
    ],
    female: [
        { id: 'B1', name: '田媛寧', get icon() { return `<img src="${getCharacterImageUrl('f1')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="田媛寧">`; } },
        { id: 'B2', name: '張栖鈴', get icon() { return `<img src="${getCharacterImageUrl('f2')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="張栖鈴">`; } },
        { id: 'B3', name: '顧音棉', get icon() { return `<img src="${getCharacterImageUrl('f3')}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="顧音棉">`; } }
    ]
};

// Game State
let gameState = {
    currentStep: 'targetGender',
    targetGender: null,
    targetCharacter: null,
    playerGender: null,
    resolvedTargetGender: null,
    resolvedTargetCharacter: null,
    resolvedPlayerGender: null,
    preferences: {
        npcColor: '#d6336c',
        playerColor: '#4facfe',
        textColor: '#ffffff',
        actionColor: '#b0b0b0'
    },
    // 故事引擎狀態
    currentNode: 'start',
    targetKey: null,
    stats: {
        trust: 0, curiosity: 0, fear: 0, affection: 0, courage: 0
    },
    flags: {
        mystery_route: false, ice_route: false, normal_route: false,
        followed_target: false, recovered_memory: false, abandoned_partner: false
    }
};

// Character Meta Info (for Story Playing)
const characters = {
    m1: { name: "洛頁彥" },
    m2: { name: "齊勻楠" },
    m3: { name: "秦陌寂" },
    f1: { name: "田媛寧" },
    f2: { name: "張栖鈴" },
    f3: { name: "顧音棉" }
};

// --- 劇本資料庫 ---
function buildStoryNodes() {
    const nodes = {
        'start': {
            'text': "歡迎來到《舊校舍的約定》。\n請選擇你想要體驗的戀愛故事類型：",
            'choices': [
                { 'text': "男男戀 (BL)", 'next': "select_target_m" },
                { 'text': "女女戀 (GL)", 'next': "select_target_f" },
                { 'text': "男女戀 (HL)", 'next': "node_hl_gender" }
            ]
        },
        'node_hl_gender': {
            'text': "請選擇你想扮演的性別：",
            'choices': [
                { 'text': "扮演男生 (對象為女性)", 'next': "select_target_f" },
                { 'text': "扮演女生 (對象為男性)", 'next': "select_target_m" },
                { 'text': "交給命運決定 (隨機)", 'next': "select_target_f" }
            ]
        },
        'select_target_m': {
            'text': "請選擇你想攻略的對象：",
            'choices': [
                { 'text': "洛頁彥 (開朗大膽，艷紅髮色)", 'targetKey': "m1", 'next': "intro_m1" },
                { 'text': "齊勻楠 (沉穩細心，長相俊朗)", 'targetKey': "m2", 'next': "intro_m2" },
                { 'text': "秦陌寂 (溫和斯文，銀框眼鏡)", 'targetKey': "m3", 'next': "intro_m3" }
            ]
        },
        'select_target_f': {
            'text': "請選擇你想攻略的對象：",
            'choices': [
                { 'text': "田媛寧 (溫柔內斂，深褐捲髮)", 'targetKey': "f1", 'next': "intro_f1" },
                { 'text': "張栖鈴 (機靈艷麗，黑色長髮)", 'targetKey': "f2", 'next': "intro_f2" },
                { 'text': "顧音棉 (張揚自信，粉髮雙馬尾)", 'targetKey': "f3", 'next': "intro_f3" }
            ]
        }
    };

    const storylines = {
        'm1': {
            'intro': "放學時，一個踩著滑板的紅髮少年差點撞上你！\n「嗚哇！抱歉抱歉...」他跳下滑板，看清你的臉後，開朗的笑容瞬間凝固，隨後激動地睜大眼睛：「欸？！你...你果然回來了！」",
            'intro_choices': [["「你認錯人了，借過。」", { "affection": -1, "ice_route": true }], ["「你怎麼知道我回來了？」", { "fear": 1, "mystery_route": true }], ["「小心點啊，你誰？」", { "trust": 2, "curiosity": 1 }]],
            'lunch_a': "隔天中午，洛頁彥抱著便當，有些委屈地湊過來：「喂，你昨天好冷淡啊...本大爺有這麼討人厭嗎？今天分你一隻大炸蝦，不准再生氣囉！」",
            'lunch_a_choices': [["默默移開視線，不接他的炸蝦", { "affection": -1, "ice_route": true }], ["「你為什麼一定要找我吃午餐？」", { "curiosity": 1 }], ["「好啦，謝謝你的炸蝦。」", { "affection": 1, "trust": 1 }]],
            'lunch_b': "隔天中午，洛頁彥神秘地把你拉到角落：「你昨天問我怎麼知道你回來...其實，我一直留著我們小時候的約定。對了，你對學校的怪談有頭緒嗎？」",
            'lunch_b_choices': [["「我沒興趣，別問我。」", { "fear": 1, "ice_route": true }], ["「怪談？難道跟我們的過去過去有關？」", { "curiosity": 2, "mystery_route": true }], ["「先別管怪談了，你便當裡的炸豬排看起來不錯。」", { "affection": 2, "trust": 1 }]],
            'lunch_c': "隔天中午，洛頁彥開心地直接坐到你對面，笑得十分燦爛：「欸嘿！昨天差點撞到你，今天本大爺特地帶了超豐盛的便當跟你分享，這塊大炸豬排分你吃！」",
            'lunch_c_choices': [["「拿開，我吃飽了。」", { "affection": -1, "ice_route": true }], ["「你對每個人都這麼熱情嗎？」", { "curiosity": 1 }], ["「謝謝！看起來好好吃，我們一起吃吧！」", { "affection": 2, "trust": 2 }]],
            'prep_a': "吃完午餐，洛頁彥趴在桌上，有些洩氣：「你這人真是冰山一塊...不過，聽說舊校舍晚上鬧鬼，你該不會是怕鬼才這麼冷淡吧？敢不敢去探險？」",
            'prep_a_choices': [["「幼稚，我才不去。」", { "fear": 1, "ice_route": true }], ["「鬧鬼？有什麼具體的傳聞嗎？」", { "curiosity": 2 }], ["「如果你希望我去的話...」", { "affection": 2, "trust": 1 }]],
            'prep_b': "吃完午餐，洛頁彥拿出一罐奇怪的能量飲料，低聲說：「我調查過了，舊校舍深夜會有紅光。這絕對跟十年前我們的秘密有關！你想去看看嗎？」",
            'prep_b_choices': [["「這跟我沒關係，我不去。」", { "fear": 1, "ice_route": true }], ["「紅光？我們一定要去調查個水落石出！」", { "curiosity": 2, "courage": 1, "mystery_route": true }], ["「聽起來有點危險，但有你在的話...」", { "affection": 2, "trust": 2 }]],
            'prep_c': "吃完午餐，洛頁彥神神秘秘地湊到你耳邊，溫熱的呼吸讓你臉頰微紅：「欸，今晚舊校舍好像有流星雨觀測點喔！雖然大家都說是鬧鬼，但我想帶你去最棒的祕密基地看，去不去？」",
            'prep_c_choices': [["「看流星？太無聊了。」", { "ice_route": true }], ["「祕密基地？你以前常去嗎？」", { "curiosity": 2 }], ["「聽起來很浪漫，我們一起去！」", { "affection": 3, "trust": 2 }]],
            'rumor_a': "放學後在走廊，洛頁彥默默跟在你後面。突然一隻櫃子劇烈搖晃！他快步上前拉開，掉出一本舊筆記。他冷哼：「哼，看吧，有怪事發生了，你還要裝冷酷嗎？」",
            'rumor_a_choices': [["「拿去給老師處理吧。」", { "trust": 1, "normal_route": true }], ["「這本筆記畫的...是舊校舍地圖？」", { "curiosity": 2 }], ["「謝謝你剛才拉住我。」", { "affection": 2, "trust": 1 }]],
            'rumor_b': "放學後的走廊一片昏暗，置物櫃傳來刺耳的抓撓聲！洛頁彥毫不猶豫扯開櫃子，裡面掉出一本舊筆記。他激動大喊：「找到了！這就是當年的機關地圖！」",
            'rumor_b_choices': [["「這太詭異了，把它丟掉吧。」", { "fear": 2, "ice_route": true }], ["「打開來，我們仔計研究線索。」", { "curiosity": 3, "courage": 1, "mystery_route": true }], ["「不要太勉強自己，這看起來很不詳。」", { "trust": 2, "affection": 1 }]],
            'rumor_c': "放學後的夕陽灑在走廊上，置物櫃突然發出聲響。洛頁彥笑著扯開櫃子，裡面掉出一本舊筆記。他順手翻開，指著地圖上畫的一顆心：「你看，這是不是我們小時候畫的？」",
            'rumor_c_choices': [["「別胡說，我才不記得。」", { "affection": -1, "ice_route": true }], ["「這上面寫著...約定之地？」", { "curiosity": 2 }], ["「那我們真的得去舊校舍確認一下了。」", { "affection": 2, "trust": 2, "courage": 1 }]],
            'festival_a': "校園祭到了，洛頁彥有些落寞地看著你：「今天這麼熱鬧，你還是不打算笑一個嗎？本大爺最後問你一次，你今天想去哪裡？」",
            'festival_a_choices': [["「好，我們去舊校舍探險！」", { "courage": 1, "trust": 1 }, "investigate"], ["偷偷跟隨他身後看他幹嘛", { "fear": 1, "followed_target": true }, "follow"], ["「不去，我們去吃章魚燒。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_b': "校園祭人聲鼎沸，洛頁彥神色嚴肅地拉著你：「我感覺今晚舊校舍會有大動靜。我們不能就這樣看著，走，開始行動！」",
            'festival_b_choices': [["「好，我們去舊校舍探險！」", { "courage": 1, "trust": 1 }, "investigate"], ["偷偷跟隨他身後看他幹嘛", { "fear": 1, "followed_target": true }, "follow"], ["「不去，我們去吃章魚燒。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_c': "校園祭熱鬧非凡，洛頁彥興奮地一把拉住你的手，十指緊扣：「走吧！不管前面有什麼，本大爺都會帶著你衝過去的！我們先去哪？」",
            'festival_c_choices': [["「好，我們去舊校舍探險！」", { "courage": 1, "trust": 1 }, "investigate"], ["偷偷跟隨他身後看他幹嘛", { "fear": 1, "followed_target": true }, "follow"], ["「不去，我們去吃章魚燒。」", { "affection": 2, "normal_route": true }, "daily"]],
            'investigate': "你們踢開舊校舍的門，結果洛頁彥踩空了木板！\n「危險！」他粗心地跌倒，卻在墜落前死命護住你：\n「別怕！這次換我來保護你...就像以前一樣！」",
            'investigate_choices': [["緊緊抓著他：「我不怕！」", { "affection": 3, "trust": 2 }], ["「以前到底發生過什麼？」", { "curiosity": 2 }], ["嚇得甩開他逃跑", { "fear": 3, "abandoned_partner": true }]],
            'follow': "你偷偷跟著他，發現他在舊校舍牆壁上塗鴉驅邪符號。\n他一轉頭看到你，嚇了一跳：「你不該來這裡的...萬一你想起來怎麼辦？」",
            'follow_choices': [["「把你知道的全部告訴我！」", { "curiosity": 2, "courage": 1 }], ["「我只是擔心你...」", { "trust": 2, "affection": 2 }], ["覺得他是怪人，轉身逃跑", { "fear": 3, "abandoned_partner": true }]],
            'daily': "你們在攤位狂吃，他笑得像個孩子。\n「哈哈哈，太好吃了！如果每天都能這樣就好了...」他的笑容裡卻閃過一絲落寞。",
            'daily_choices': [["把最後一顆章魚燒餵給他", { "affection": 3, "trust": 1 }], ["「你為什麼一直避開舊校舍？」", { "curiosity": 1, "fear": 1 }], ["嫌他吃相太難看，自己先走", { "abandoned_partner": true }]],
            'aftermath_a': "冷清的走廊上，洛頁彥背對著你，語氣裡少見地帶著疲憊：「你總是拒我於千里之外...但我真的很怕，十年前那種失去你的感覺會再次發生。」",
            'aftermath_a_choices': [["「對不起，我沒想到你這麼在乎。」", { "affection": 2, "trust": 1 }], ["「十年前的事...你到底知道什麼？」", { "curiosity": 2 }]],
            'aftermath_b': "在安靜的樓梯間，洛頁彥看著發光的驅邪符號，擦了擦額頭的汗水：「剛剛的動靜不是巧合，有人故意想阻止我們想起來...你，真的想知道全部的真相嗎？」",
            'aftermath_b_choices': [["「我不怕危險，告訴我吧。」", { "trust": 2, "courage": 1 }], ["「這太詭異了，我們回去吧。」", { "fear": 2 }]],
            'aftermath_c': "安全脫離後，洛頁彥有些脫力地靠在你的肩上，耳根通紅：「呼...嚇死我了。剛剛保護你時，我心跳得超快...不只是因為害怕，更是因為你靠得這麼近...」",
            'aftermath_c_choices': [["也靠著他：「謝謝你保護了我。」", { "affection": 3, "trust": 2 }], ["「你的心跳真的好快呢...」", { "affection": 2, "curiosity": 1 }]],
            'memory': "在廢棄教室，你找到一個生鏽的滑板頭盔。當年你差點從二樓摔下，是他墊在你身下，頭盔上的裂痕就是證明。\n洛頁彥紅著眼眶：「對不起讓你久等了！我一直都在這裡喔！」",
            'memory_alt': "煙火升空，洛頁彥看著天空，艷紅的頭髮隨風飄動。\n「要是能一直這樣開心就好了...對吧？」",
        },
        'm2': {
            'intro': "走廊上，一名黑髮少年正拿著捲尺測量距離。他停下動作，深邃的眼神鎖定你。\n「……你果然回來了。誤差不到一天，剛好是約定好的日子。」",
            'intro_choices': [["「神經病。」直接走人", { "affection": -1, "ice_route": true }], ["「你在監視我嗎？」", { "fear": 1, "mystery_route": true }], ["「約定？你在說什麼？」", { "trust": 2, "curiosity": 1 }]],
            'lunch_a': "午餐時間，齊勻楠看著冷淡的你，微微蹙眉：「我知道你對我保持戒備。但這盒低脂高蛋白便當是我特地為你調整的，請至少吃一口。」",
            'lunch_a_choices': [["「拿走，我不需要你的多管閒事。」", { "affection": -1, "ice_route": true }], ["「你為什麼連我的飲食都要計算？」", { "curiosity": 1 }], ["「好吧，謝謝你的便當。」", { "affection": 1, "trust": 1 }]],
            'lunch_b': "午餐時間，齊勻楠拿出他的平板電腦，滑動著密密麻麻的數據：「我根據你回來的時間與十年前的校園紀錄進行了交叉對比，發現了一些異常數據。你想看嗎？」",
            'lunch_b_choices': [["「我對這些數據沒興趣。」", { "fear": 1, "ice_route": true }], ["「異常數據？是指舊校舍的傳聞嗎？」", { "curiosity": 2, "mystery_route": true }], ["「你天天計算這些，眼睛不酸嗎？」", { "affection": 2, "trust": 1 }]],
            'lunch_c': "午餐時間，齊勻楠有些害羞地把便當推到你面前：「我計算了你今天的卡路里與營養配比，這塊精心煎過的雞胸肉分給你，這對你的身體最好。」",
            'lunch_c_choices': [["故意把不健康的薯條分給他", { "affection": 1, "ice_route": true }], ["「這算是你的專屬關心嗎？」", { "curiosity": 1, "affection": 2 }], ["「哇，看起來好美味，謝謝！」", { "affection": 2, "trust": 2 }]],
            'prep_a': "下課時，齊勻楠面無表情地遞給你一份舊校舍的安全警告：「雖然你不想理我，但統計顯示舊校舍晚間的危險係數高達95%，我不能讓你去。」",
            'prep_a_choices': [["「多餘的擔心，我本來就不去。」", { "fear": 1, "ice_route": true }], ["「危險係數？是有什麼物理上的危險？」", { "curiosity": 2 }], ["「謝謝你的警告，我會注意的。」", { "affection": 2, "trust": 1 }]],
            'prep_b': "班會課後，齊勻楠拉上窗簾，神情嚴肅地給你看他整理的『舊校舍怪談分析報告』：「根據論壇發文頻率與實地電磁波測量，今晚那裡有異常的磁場擾動。」",
            'prep_b_choices': [["「這是不科學的迷信，別管了。」", { "fear": 1, "ice_route": true }], ["「磁場擾動？我們需要進一步實地測量！」", { "curiosity": 2, "courage": 1, "mystery_route": true }], ["「你這麼認真地寫報告，都是為了我？」", { "affection": 2, "trust": 2 }]],
            'prep_c': "班會課後，齊勻楠走到你座位旁，拿出一張手寫的祭典路線圖：「我規劃了避開人潮與噪音的最佳路線，如果...如果你想逛祭典，我想當你的嚮導。」",
            'prep_c_choices': [["「我自己逛就好，不用規劃。」", { "ice_route": true }], ["「這條路線...終點好像是舊校舍後面？」", { "curiosity": 2 }], ["「好精緻的路線！我很期待跟你一起去。」", { "affection": 3, "trust": 2 }]],
            'rumor_a': "在走廊上，齊勻楠指著被撬開的置物櫃，冷靜分析：「這個力道是從內部產生的。裡面掉出的地圖筆記，我已經用相機記錄了。你還要假裝看不見異常嗎？」",
            'rumor_a_choices': [["「這一定是有人惡作劇，走吧。」", { "trust": 1, "normal_route": true }], ["「筆記上的筆跡...好像很眼熟？」", { "curiosity": 2 }], ["「好吧，我相信你的分析。」", { "affection": 2, "trust": 1 }]],
            'rumor_b': "齊勻楠駭入了學校論壇的隱藏版塊，螢幕上閃爍著十年前的貼文。他低聲讀出：「『如果看見紅光，千萬不要回頭』。這本舊筆記的地圖與這篇貼文吻合。」",
            'rumor_b_choices': [["「這太毛骨悚然了，快關掉！」", { "fear": 2, "ice_route": true }], ["「我們把地圖印出來當作今晚的線索。」", { "curiosity": 3, "courage": 1, "mystery_route": true }], ["「這貼文是不是有你的筆跡？你隱瞞了什麼？」", { "trust": 2, "affection": 1 }]],
            'rumor_c': "齊勻楠指著舊筆記上的標記，嘴角揚起罕見的酒窩：「你看，這頁地圖旁邊寫著你的名字。這證明了我的邏輯推論——我們在十年前，就已經是彼此的坐標了。」",
            'rumor_c_choices': [["「這說明不了什麼，只是巧合。」", { "affection": -1, "ice_route": true }], ["「我的名字？那旁邊的愛心又是什麼？」", { "curiosity": 2 }], ["「既然是約定，那我們就一起去解開它吧。」", { "affection": 2, "trust": 2, "courage": 1 }]],
            'festival_a': "校園祭人潮洶湧，齊勻楠看著你的距離，眼神掠過一絲落寞：「我計算了我們之間的最佳社交距離...你真的，不想靠近我一點嗎？」",
            'festival_a_choices': [["「但我偏想去舊校舍看看！」", { "courage": 1, "trust": 1 }, "investigate"], ["假裝去洗手間，偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「好，我跟著你走。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_b': "齊勻楠拿著紅外線探測儀，低聲對你說：「舊校舍北棟的電磁波值正在持續攀升。我已經做好了所有應對方案，準備好出發了嗎？」",
            'festival_b_choices': [["「但我偏想去舊校舍看看！」", { "courage": 1, "trust": 1 }, "investigate"], ["假裝去洗手間，偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「好，我跟著你走。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_c': "齊勻楠臉色泛紅，有些緊張地伸出手指，輕輕拉住你的衣角：「根據我的計算，在擁擠的人群中，我們牽手的防走失機率是100%。可以牽嗎？」",
            'festival_c_choices': [["「但我偏想去舊校舍看看！」", { "courage": 1, "trust": 1 }, "investigate"], ["假裝去洗手間，偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「好，我跟著你走。」", { "affection": 2, "normal_route": true }, "daily"]],
            'investigate': "舊校舍突然停電，齊勻楠立刻抽出準備好的手電筒，將你護在身後。\n「退後。我會保護你...就像以前一樣。」",
            'investigate_choices': [["躲在他寬闊的背後", { "affection": 3, "trust": 2 }], ["「以前也停電過嗎？」", { "curiosity": 2 }], ["太黑了，嚇得往外衝", { "fear": 3, "abandoned_partner": true }]],
            'follow': "你偷偷去舊校舍，發現他正在安裝紅外線感測器。\n他無奈地嘆氣：「你不該來這裡的...萬一記憶被刺激而想起來...」",
            'follow_choices': [["「把你知道的全部告訴我！」", { "curiosity": 2, "courage": 1 }], ["「我只是想跟你在一起。」", { "trust": 2, "affection": 2 }], ["覺得太危險，逃離現場", { "fear": 3, "abandoned_partner": true }]],
            'daily': "你們完美地逛完了所有攤位，享受了沒有排隊的完美祭典。\n他看著你開心的樣子，嘴角揚起溫柔的酒窩。",
            'daily_choices': [["「跟你在一起真好。」", { "affection": 3, "trust": 1 }], ["「你為什麼一直避開舊校舍？」", { "curiosity": 1, "fear": 1 }], ["覺得行程太死板，自己跑掉", { "abandoned_partner": true }]],
            'aftermath_a': "安全脫離後，齊勻楠站在冷風中，微微低下頭：「我的邏輯模型計算了所有危險...卻唯獨無法算出你冷淡的眼神會讓我多痛苦。我做錯了什麼嗎？」",
            'aftermath_a_choices': [["「沒這回事，我只是不太習慣...」", { "affection": 2, "trust": 1 }], ["「你不需要為我的安全承擔責任。」", { "fear": 1 }]],
            'aftermath_b': "逃離險境後，他用隨身的醫療手電筒仔細檢查你是否受傷，他的手指微微顫抖著：「我計算了所有的風險機率...卻沒算到我看到你遇險時會有多恐慌。」",
            'aftermath_b_choices': [["握住他顫抖的手", { "affection": 3, "trust": 2 }], ["「原來你也會慌張啊？」", { "affection": 2, "curiosity": 1 }]],
            'aftermath_c': "安全後，齊勻楠輕輕將你拉到長椅上，他的手依然緊握著你的手，眼底滿是溫柔的酒窩：「我的心跳頻率是每分鐘120次...這並非體能消耗，而是因為你在我身邊。」",
            'aftermath_c_choices': [["握緊他的手：「那我的心跳應該也是。」", { "affection": 3, "trust": 2 }], ["「這是什麼奇怪的測量數據啦。」", { "affection": 1, "curiosity": 1 }]],
            'memory': "你找到一本上了密碼鎖的日記，密碼是你的生日。裡面寫滿了他為了尋找讓你恢復記憶的方法，研究舊校舍多年的紀錄。\n齊勻楠握緊你的手：「我也想起來了...這一次，我不會再放手。」",
            'memory_alt': "煙火綻放，他早已計算好最佳的觀賞角度。\n「只要你平安開心就好...其他的，我來承擔。」",
        },
        'm3': {
            'intro': "你不小心撞落了書本，一名戴著銀框眼鏡的棕髮學長溫柔地幫你撿起。\n他推了推眼鏡，露出安心的微笑：「太好了，你果然回來了。這不是夢吧？」",
            'intro_choices': [["拿過書，沉默離開", { "affection": -1, "ice_route": true }], ["「你怎麼知道我是誰？」", { "fear": 1, "mystery_route": true }], ["「學長...我們認識嗎？」", { "trust": 2, "curiosity": 1 }]],
            'lunch_a': "午休時，秦陌寂提著精美的日式餐盒，有些拘謹地微笑：「學弟/學妹，聽說你昨天心情不好。這是我自己做的一些精緻小菜，如果不嫌棄的話，可以嘗嘗看。」",
            'lunch_a_choices': [["「不用了，我自己有買。」", { "affection": -1, "ice_route": true }], ["「學長對每個人都這麼貼心嗎？」", { "curiosity": 1 }], ["「謝謝學長，那我不客氣了。」", { "affection": 1, "trust": 1 }]],
            'lunch_b': "午休時，秦陌寂在圖書館角落找到你，低聲說：「其實...我一直在等你回來。這份校園的舊剪報，記錄了十年前舊校舍的事故，我想你應該想知道。」",
            'lunch_b_choices': [["「那是以前的事，我不想看。」", { "fear": 1, "ice_route": true }], ["「十年前的事故？學長當時也在場嗎？」", { "curiosity": 2, "mystery_route": true }], ["「學長，這份剪報比你手裡的熱茶還重要嗎？」", { "affection": 2, "trust": 1 }]],
            'lunch_c': "午休時，秦陌寂溫柔地微笑，遞給你一個漂亮的雙層便當：「這手藝是我親手做的玉子燒和炸雞，特地做成了你喜歡的口味。要一起吃嗎？」",
            'lunch_c_choices': [["「我不喜歡吃玉子燒。」", { "affection": -1, "ice_route": true }], ["「學長怎麼知道我喜歡吃炸雞？」", { "curiosity": 1, "affection": 2 }], ["給學長餵食一塊玉子燒", { "affection": 3, "trust": 2 }]],
            'prep_a': "放學前，秦陌寂為你泡了一杯安神茶放在桌上，有些失落但溫柔地說：「如果你累了，就喝杯茶休息吧。舊校舍的傳聞很危險，聽學長的話，不要靠近。」",
            'prep_a_choices': [["默默推開茶杯：「我不需要。」", { "fear": 1, "ice_route": true }], ["「學長，那傳聞到底是怎麼回事？」", { "curiosity": 2 }], ["「謝謝學長，這茶很香。」", { "affection": 2, "trust": 1 }]],
            'prep_b': "秦陌寂將你帶到沒有人的音樂教室，神神秘密地給你看他的筆記：「我一直在整理舊校舍的靈異檔案。那裡的不祥氣息，似乎是衝著當年存活下來的你來的...」",
            'prep_b_choices': [["「這太荒謬了，我不想參與。」", { "fear": 1, "ice_route": true }], ["「衝著我來的？學長，我們今晚必須去調查！」", { "curiosity": 2, "courage": 1, "mystery_route": true }], ["「既然這麼危險，學長為什麼還要幫我調查？」", { "affection": 2, "trust": 2 }]],
            'prep_c': "秦陌寂溫柔地將一件外套披在你的肩上，笑著說：「今天有涼意，別感冒了。校園祭晚上有浪漫的煙火，我想帶你去頂樓的特等席看，好嗎？」",
            'prep_c_choices': [["把外套還給他：「我不冷。」", { "ice_route": true }], ["「頂樓？那裡不是離舊校舍很近嗎？」", { "curiosity": 2 }], ["「學長真體貼，我一定會去的。」", { "affection": 3, "trust": 2 }]],
            'rumor_a': "走廊角落的置物櫃發出抓撓聲。秦陌寂默默擋在你前面，扯開櫃子拿出一本舊相本，輕聲說：「別怕，鎖在裡面的舊相本。雖然你不想理我，但我會保護好你的。」",
            'rumor_a_choices': [["「我自己能行，不用你擋在前面。」", { "trust": 1, "normal_route": true }], ["「相本裡的照片...好像有我們的合照？」", { "curiosity": 2 }], ["「謝謝學長擋在我面前。」", { "affection": 2, "trust": 1 }]],
            'rumor_b': "圖書館窗外狂風大作，吹落了一本泛黃的校史筆記。秦陌寂推了推銀框眼鏡，眼神閃過一絲痛苦：「日記裡寫的...是當年的受傷名單。我的名字，就在你的名字旁邊。」",
            'rumor_b_choices': [["「這太沉重了，把書放回去吧。」", { "fear": 2, "ice_route": true }], ["「這日記是解開真相的關鍵，我們帶上它。」", { "curiosity": 3, "courage": 1, "mystery_route": true }], ["「學長...你當時也受傷了嗎？你的傷口在哪？」", { "trust": 2, "affection": 1 }]],
            'rumor_c': "秦陌寂在舊書堆中翻出一片壓花書籤，遞給你時，指尖的溫熱讓你心跳加速。他斯文地笑著：「這是我以前送給你的。看來，有些回憶即使沾滿灰塵，依然很溫暖呢。」",
            'rumor_c_choices': [["「這只是一片枯葉罷了。」", { "affection": -1, "ice_route": true }], ["「這花語代表著...『約定的重逢』嗎？」", { "curiosity": 2 }], ["「真的很漂亮，謝謝學長一直留著它。」", { "affection": 2, "trust": 2, "courage": 1 }]],
            'festival_a': "校園祭時，秦陌寂默默走在你身側，有些落寞地看著你：「學長今天是不是打擾到你了？如果...如果你不希望我陪著，我會退後一些。」",
            'festival_a_choices': [["「我們去舊校舍看看」", { "courage": 1, "trust": 1 }, "investigate"], ["趁他不注意，偷偷前往舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「好，我們就在這喝茶。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_b': "秦陌寂一改平時的斯文，神色擔憂地拉著你：「我看到有人在舊校舍附近徘徊。為了安全，我們必須立刻過去確認。跟緊我。」",
            'festival_b_choices': [["「我們去舊校舍看看」", { "courage": 1, "trust": 1 }, "investigate"], ["趁他不注意，偷偷前往舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「好，我們就在這喝茶。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_c': "秦陌寂斯文地牽起你的手，溫柔地笑著：「祭典上人很多，我不想我們在人群中走散。牽著學長的手，好嗎？」",
            'festival_c_choices': [["「我們去舊校舍看看」", { "courage": 1, "trust": 1 }, "investigate"], ["趁他不注意，偷偷前往舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「好，我們就在這喝茶。」", { "affection": 2, "normal_route": true }, "daily"]],
            'investigate': "舊校舍傳出怪聲，一堆蝙蝠飛出！秦陌寂冷靜地用外套護住你。\n「深呼吸，沒事的。我會保護你...就像以前一樣。」",
            'investigate_choices': [["靠在他懷裡感到無比安心", { "affection": 3, "trust": 2 }], ["「以前你也這樣保護過我？」", { "curiosity": 2 }], ["推開他崩潰逃跑", { "fear": 3, "abandoned_partner": true }]],
            'follow': "你偷偷前往舊校舍，發現他正在清理地上的碎玻璃。\n他看到你，眼神閃過一絲痛苦：「你不該來這裡的...會想起來那段可怕的記憶的。」",
            'follow_choices': [["「我必須知道真相！」", { "curiosity": 2, "courage": 1 }], ["「只要有學長在就不怕。」", { "trust": 2, "affection": 2 }], ["覺得氣氛太沉重，跑走", { "fear": 3, "abandoned_partner": true }]],
            'daily': "茶香與祭典的熱鬧形成對比，他溫柔地傾聽你說話。\n看著他斯文的微笑，你覺得一切都很平靜。",
            'daily_choices': [["「學長一直都很溫柔呢。」", { "affection": 3, "trust": 1 }], ["「學長為什麼一直盯著舊校舍？」", { "curiosity": 1, "fear": 1 }], ["覺得太無聊，跑去玩別的", { "abandoned_partner": true }]],
            'aftermath_a': "安全脫離後，秦陌寂輕輕嘆息，眼神裡是掩飾不住的失落：「我曾向自己發誓要保護好你...哪怕你討厭我，我也希望你平安無事。」",
            'aftermath_a_choices': [["「我沒有討厭學長...」", { "affection": 2, "trust": 1 }], ["「學長太過保護我了。」", { "fear": 1 }]],
            'aftermath_b': "事件平息後，他輕柔地拂去你臉頰上沾到的灰塵，眼眸滿是自責：「我還是失職了，讓你陷入危險...我真的很怕，十年前的噩夢會重演。」",
            'aftermath_b_choices': [["握住他拂過臉頰的手", { "affection": 3, "trust": 2 }], ["「再經歷一次？什麼意思？」", { "curiosity": 2, "courage": 1 }]],
            'aftermath_c': "安全後，秦陌寂溫柔地將你擁入懷中，他的呼吸在你耳畔起伏，溫暖而令人安心：「太好了...你沒事。那一瞬間，我真的差點嚇瘋了...」",
            'aftermath_c_choices': [["緊緊抱住他：「學長別慌，我沒事。」", { "affection": 3, "trust": 2 }], ["「學長的懷抱好溫暖...」", { "affection": 3, "fear": -1 }]],
            'memory': "你在一個廢棄櫃子裡找到一個舊醫藥箱。當年你因為傳聞跑來探險而受重傷，是他用這個醫藥箱幫你止血，並陪了你整晚。\n秦陌寂輕撫你的臉龐：「太好了...你終於想起來了。這段時間辛苦你了。」",
            'memory_alt': "煙火的光芒映照在他的眼鏡上。\n「只要你平安開心就好...忘記過去也沒關係。」",
        },
        'f1': {
            'intro': "走廊角落，深褐色捲髮的少女正在插花。看到你，她手中的花不慎掉落。\n她微微一愣，隨即露出溫柔禮貌的微笑：「你果然回來了呢，我一直相信著...」",
            'intro_choices': [["「不好意思打擾了。」轉身離開", { "affection": -1, "ice_route": true }], ["「你這句話是什麼意思？」", { "fear": 1, "mystery_route": true }], ["「我們以前見過嗎？」", { "trust": 2, "curiosity": 1 }]],
            'lunch_a': "午休時，田媛寧端著一個精緻的點心盤，有些怯生生地叫住你：「那個...昨天我是不是說錯了什麼？這是我自己烤的櫻花餅，希望你能收下...」",
            'lunch_a_choices': [["「我不喜歡吃甜食，不好意思。」", { "affection": -1, "ice_route": true }], ["「妳為什麼總是在走廊等我？」", { "curiosity": 1 }], ["「謝謝妳，看起來很好吃。」", { "affection": 1, "trust": 1 }]],
            'lunch_b': "午休時，田媛寧在無人的溫室裡找到你，遞給你看一張老舊的植物標本：「其實，這是在舊校舍後方發現的枯萎彼岸花。十年前我們一起在那裡種過花...妳還記得嗎？」",
            'lunch_b_choices': [["「那是過去的事了，我不記得。」", { "fear": 1, "ice_route": true }], ["「枯萎的彼岸花？這是不是代表某種不祥的詛咒？」", { "curiosity": 2, "mystery_route": true }], ["「標本很美，但妳的臉色看起來很蒼白，沒事吧？」", { "affection": 2, "trust": 1 }]],
            'lunch_c': "午休時，田媛寧紅著臉指著頂樓角落的小貓：「要...要一起來摸摸牠嗎？這隻小貓平時很怕生，但好像特別喜歡你呢，就像我一樣...啊，沒事！」",
            'lunch_c_choices': [["「我對貓過敏，先走了。」", { "affection": -1, "ice_route": true }], ["「妳剛剛說，像妳一樣什麼？」", { "curiosity": 1, "affection": 2 }], ["「好可愛啊，我們一起餵牠吧。」", { "affection": 2, "trust": 2 }]],
            'prep_a': "下課時，田媛寧輕輕放在你桌上一份手寫的地圖，字跡清秀：「雖然你不太理我，但舊校舍最近很不安全，請務必答應我，晚上不要去那裡探險，好嗎？」",
            'prep_a_choices': [["揉掉地圖：「我不喜歡別人管我的事。」", { "fear": 1, "ice_route": true }], ["「不安全？妳是不是隱瞞了什麼危險？」", { "curiosity": 2 }], ["「謝謝妳的關心，我答應妳。」", { "affection": 2, "trust": 1 }]],
            'prep_b': "田媛寧拉著你來到人跡罕至的舊溫室，有些驚慌地遞出一本日記：「我找到了當年的花卉日記。事故發生的那天晚上，舊校舍的植物在一夜之間全部枯萎了...這很不尋常。」",
            'prep_b_choices': [["「植物枯萎只是自然現象，別自己嚇自己。」", { "fear": 1, "ice_route": true }], ["「一夜枯萎？我們今天晚上必須去現場採集樣本！」", { "curiosity": 2, "courage": 1, "mystery_route": true }], ["「溫室裡有些冷，我幫妳披上外套吧。」", { "affection": 2, "trust": 2 }]],
            'prep_c': "田媛寧遞給你一張繪製得十分可愛的祭典地圖，上面貼滿了貓咪貼紙：「這是我整理的祭典推薦攤位...如果可以的話，今晚我想陪你一起逛逛，可以嗎？」",
            'prep_c_choices': [["「我不喜歡照著計畫逛，自己走吧。」", { "ice_route": true }], ["「地圖上的『秘密花園』是指舊校舍後面嗎？」", { "curiosity": 2 }], ["「太可愛了！有妳陪我，今天一定會很開心。」", { "affection": 3, "trust": 2 }]],
            'rumor_a': "走廊的置物櫃傳來異響。田媛寧有些害怕但還是鼓起勇氣，用她的鑰匙打開櫃子，掉出一本植物筆記。她低著頭說：「這是十年前我們寫的...雖然你對我很冷淡，但我一直留著它。」",
            'rumor_a_choices': [["「髒兮兮的，丟了吧。」", { "trust": 1, "normal_route": true }], ["「裡面的乾燥花...是小時候種的風信子嗎？」", { "curiosity": 2 }], ["「謝謝妳把它保留得這麼好。」", { "affection": 2, "trust": 1 }]],
            'rumor_b': "在昏暗的圖書室裡，一陣怪風吹落了一張舊照片。田媛寧看著照片中模糊的背影，眼眶微紅：「這照片是在舊校舍走廊拍下的...當時我就在你身後，看著你被黑暗吞噬...」",
            'rumor_b_choices': [["「這照片太詭異了，快把它燒掉！」", { "fear": 2, "ice_route": true }], ["「這照片角落有不明發光體，是重要線索。」", { "curiosity": 3, "courage": 1, "mystery_route": true }], ["「別哭，那只是意外，我現在好好地站在這裡。」", { "trust": 2, "affection": 1 }]],
            'rumor_c': "田媛寧指著舊筆記本上的一片壓花，抬頭看著你，臉頰飛紅。微風吹動她的褐色捲髮，散發著淡淡的花香：「這壓花的花語是『永恆的約定』。我一直相信，你一定會回來找我的。」",
            'rumor_c_choices': [["「花語什麼的，太預設了。」", { "affection": -1, "ice_route": true }], ["「這壓花旁邊的字跡...是我寫的嗎？」", { "curiosity": 2 }], ["「我也很高興，我能再次遇見妳。」", { "affection": 2, "trust": 2, "courage": 1 }]],
            'festival_a': "校園祭上，田媛寧抱著一束花，有些受傷地看著你：「今天你還是不願意跟我多說話嗎？如果你覺得我煩...我這就離開。」",
            'festival_a_choices': [["「我想去舊校舍探險！」", { "courage": 1, "trust": 1 }, "investigate"], ["假裝同意，中途偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「聽妳的，去圖書區吧。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_b': "田媛寧神色緊張地拉了拉你的袖子：「我剛剛在舊校舍入口發現了新鮮的腳印。事情有變，我們必須立刻去調查。」",
            'festival_b_choices': [["「我想去舊校舍探險！」", { "courage": 1, "trust": 1 }, "investigate"], ["假裝同意，中途偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「聽妳的，去圖書區吧。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_c': "田媛寧溫柔地對你微笑，雙手捧著一盒手工餅乾：「這是我特地為你烤的貓咪餅乾...我們可以一邊牽著手逛，一邊吃嗎？」",
            'festival_c_choices': [["「我想去舊校舍探險！」", { "courage": 1, "trust": 1 }, "investigate"], ["假裝同意，中途偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「聽妳的，去圖書區吧。」", { "affection": 2, "normal_route": true }, "daily"]],
            'investigate': "在舊校舍中，天花板突然掉下石塊！她深吸一口氣，將你拉到安全角落。\n「請躲在我身後。我會保護你...就像以前一樣。」",
            'investigate_choices': [["握住她微微發抖的手", { "affection": 3, "trust": 2 }], ["「以前？妳認識小時候的我？」", { "curiosity": 2 }], ["嚇壞了，獨自逃出舊校舍", { "fear": 3, "abandoned_partner": true }]],
            'follow': "你發現她偷偷在舊校舍後方獻花。\n她回頭看到你，眼眶微紅：「你不該來這裡的...會想起來那件悲傷的事。」",
            'follow_choices': [["「請告訴我全部的真相！」", { "curiosity": 2, "courage": 1 }], ["「別哭，我會陪著妳。」", { "trust": 2, "affection": 2 }], ["覺得太靈異了，逃走", { "fear": 3, "abandoned_partner": true }]],
            'daily': "你們在頂樓安靜地吃著手工便當，她的手藝非常好。\n微風吹過，她溫柔內斂的氣質讓你感到無比放鬆。",
            'daily_choices': [["「妳做的便當真好吃。」", { "affection": 3, "trust": 1 }], ["「妳為什麼要在行程裡刻意避開舊校舍？」", { "curiosity": 1, "fear": 1 }], ["覺得太安靜很無趣，提早離開", { "abandoned_partner": true }]],
            'aftermath_a': "脫離危險後，田媛寧靠在牆上微微喘息，有些失落地低下頭：「對不起...是我太笨了，才沒能保護好你，反而讓你更討厭我了...」",
            'aftermath_a_choices': [["「沒有的事，真的謝謝妳。」", { "affection": 2, "trust": 1 }], ["「我沒有討厭妳，只是在想事情。」", { "affection": 1 }]],
            'aftermath_b': "安全脫離後，田媛寧一邊幫你拍去身上的灰塵，一邊自責地掉眼淚：「對不起...是我沒有規劃好，才讓你差點受傷。十年前我就沒能拉住你...」",
            'aftermath_b_choices': [["「不是妳的錯，多虧妳保護了我。」", { "affection": 3, "trust": 2 }], ["「妳說的十年前...我們到底遭遇了什麼？」", { "curiosity": 2 }]],
            'aftermath_c': "安全後，田媛寧緊緊抱著你的手臂，靠在你的肩膀上，臉頰通紅但笑容無比溫柔內斂：「太好了...你沒事。剛剛那一刻，我真的一直向花神祈禱，只要你平安，要我做什麼都行...」",
            'aftermath_c_choices': [["輕撫她的捲髮：「我也很在乎妳的安危。」", { "affection": 3, "trust": 2 }], ["「花神真的顯靈了呢。」", { "affection": 1, "curiosity": 1 }]],
            'memory': "你在舊校舍後方發現了一個枯萎的秘密花園。當年你們一起在這裡種花，卻因為事故花園荒廢，你也失去了記憶。\n田媛寧溫柔地拭去眼淚：「沒關係的，只要你現在想起來就好了...我們重新開始吧。」",
            'memory_alt': "煙火在夜空綻放，她雙手交握祈禱。\n「只要你平安開心就好...這是我唯一的願望。」",
        },
        'f2': {
            'intro': "一名豔麗的黑髮少女正靠在走廊牆上打瞌睡。她睜開銳利的雙眼，打量著你。\n「呵，你果然回來了。算你遵守約定，沒讓我白等。」",
            'intro_choices': [["不理會她，直接走開", { "affection": -1, "ice_route": true }], ["「妳是誰？幹嘛用那種眼神看我？」", { "fear": 1, "mystery_route": true }], ["「約定？我是不是忘記了什麼？」", { "trust": 2, "curiosity": 1 }]],
            'lunch_a': "午餐時間，張栖鈴霸佔了交誼廳最舒適的沙發，看著冷淡的你，冷哼一聲：「喂，你昨天居然敢直接走掉？本小姐可是很不高興。快去幫我買杯半糖去冰珍奶，當作賠罪！」",
            'lunch_a_choices': [["「自己去買，我沒空。」", { "affection": -1, "ice_route": true }], ["「妳為什麼總是在這裡睡覺？」", { "curiosity": 1 }], ["買珍奶給她：「買來了，別生氣了。」", { "affection": 2, "trust": 1 }]],
            'lunch_b': "午餐時間，張栖鈴高傲地對你勾勾手指，把你叫到無人的走廊角落：「哼，你果然什麼都不記得了。這份從編輯部拿來的舊記錄，你自己看看，十年前是誰把你送進醫院的。」",
            'lunch_b_choices': [["「這照片看起來好恐怖，拿開。」", { "fear": 1, "ice_route": true }], ["「送我進醫院？這意外跟學校怪談有關？」", { "curiosity": 2, "mystery_route": true }], ["「所以，當年是妳救了我嗎？」", { "affection": 2, "trust": 1 }]],
            'lunch_c': "午餐時間，張栖鈴一邊喝著珍奶，一邊把最昂貴的日式炸雞便當推到你面前，高傲地說：「喂，本小姐今天胃口不好。這個便當分你吃，不准拒絕！」",
            'lunch_c_choices': [["搶走她的珍奶喝，不吃便當", { "affection": 1, "ice_route": true }], ["「妳特地分我吃，其實是擔心我吧？」", { "curiosity": 1, "affection": 2 }], ["「那我就恭敬不如從命啦！謝謝妳。」", { "affection": 2, "trust": 2 }]],
            'prep_a': "下課時，張栖鈴趴在桌上抱怨：「吵死了，那些舊校舍的傳聞煩不煩啊...警告你，你這個笨蛋可不准隨便靠近那裡，否則本小姐絕對不會去救你！」",
            'prep_a_choices': [["「那裡本來就跟我無關，我才不去。」", { "fear": 1, "ice_route": true }], ["「傳聞？妳是指舊校舍晚上會發光的流言嗎？」", { "curiosity": 2 }], ["「妳是在擔心我嗎？謝謝妳。」", { "affection": 2, "trust": 1 }]],
            'prep_b': "張栖鈴冷笑著給你看黑板上被擦掉的紅字痕跡：「這上面的粉筆粉末有特殊的螢光殘留，根本是有人刻意布置的誘餌。看來，有人想把你引誘到舊校舍去呢。」",
            'prep_b_choices': [["「這聽起來太危險了，我們還是別去吧。」", { "fear": 1, "ice_route": true }], ["「有人故意引誘我？我們今晚非去不可！」", { "curiosity": 2, "courage": 1, "mystery_route": true }], ["「既然是誘餌，妳陪我一起去，不怕危險嗎？」", { "affection": 2, "trust": 2 }]],
            'prep_c': "張栖鈴用纖細的手指戳了戳你的臉頰，傲嬌地說：「今晚的祭典...既然你誠心誠意地邀請了，本小姐就勉為其難陪你逛逛。但是，你必須負責所有的跑腿！」",
            'prep_c_choices': [["「我才沒有邀請妳，自己逛吧。」", { "ice_route": true }], ["「那妳想先去逛章魚燒還是撈金魚？」", { "curiosity": 2 }], ["「沒問題，能陪女王大人逛祭典是我的榮幸。」", { "affection": 3, "trust": 2 }]],
            'rumor_a': "置物櫃發出抓撓聲。張栖鈴冷哼一聲，走上前一腳踹開櫃子，掉出一本舊記帳本。她白了你一眼：「無聊的惡作劇。這上面寫著你小時候欠我三杯奶茶，你打算賴帳到什麼時候？」",
            'rumor_a_choices': [["「防走失，這是別人塞進來的。」", { "trust": 1, "normal_route": true }], ["「帳本上的日期...是十年前意外發生的前天？」", { "curiosity": 2 }], ["「好吧，我請妳喝一輩子的奶茶。」", { "affection": 2, "trust": 1 }]],
            'rumor_b': "在舊資料室，張栖鈴精準地從排氣孔拉出一個隱密文件袋。她眼神銳利：「找到了。這是十年前意外事件的未公開報告。上面蓋著『禁止查閱』的印章，這絕對有內幕。」",
            'rumor_b_choices': [["「這可能涉及學校的祕密，我們別看了。」", { "fear": 2, "ice_route": true }], ["「立刻拆開！這一定是解開記憶的關鍵。」", { "curiosity": 3, "courage": 1, "mystery_route": true }], ["「妳的直覺真的很敏銳，我都想拜妳為師了。」", { "trust": 2, "affection": 1 }]],
            'rumor_c': "張栖鈴指著舊櫃子裡掉出來的一個生鏽機關盒，俏皮地挑了挑眉：「這可是我們當年一起藏的寶物盒。要是你解不開密碼，本小姐就把你的糗照發給全班！」",
            'rumor_c_choices': [["「無聊，我才不玩這種小孩子遊戲。」", { "affection": -1, "ice_route": true }], ["「密碼難道是...妳的生日嗎？」", { "curiosity": 2 }], ["「只要妳別發照片，我一定會拼命解開的！」", { "affection": 2, "trust": 2, "courage": 1 }]],
            'festival_a': "校園祭上，張栖鈴高傲地抱著雙臂，有些不高興地看著你：「喂，你今天一臉嚴肅是給誰看啊？本小姐命令你，立刻給我買杯熱珍珠奶茶來！」",
            'festival_a_choices': [["「既然來了，我們去最刺激的舊校舍吧！」", { "courage": 1, "trust": 1 }, "investigate"], ["看她不想走，自己偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「那我們去買點吃的吧。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_b': "張栖鈴敏銳地低聲說：「我剛剛看到舊校舍二樓的窗簾動了。電磁干擾也在變強。看來對方已經等不及了，我們走！」",
            'festival_b_choices': [["「既然來了，我們去最刺激的舊校舍吧！」", { "courage": 1, "trust": 1 }, "investigate"], ["看她不想走，自己偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「那我們去買點吃的吧。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_c': "張栖鈴傲嬌地把手伸到你面前，豔麗的俏臉微微泛紅：「喂，人這麼多，要是你這個麻煩精走丟了本小姐可管。還不快牽著我的手！」",
            'festival_c_choices': [["「既然來了，我們去最刺激的舊校舍吧！」", { "courage": 1, "trust": 1 }, "investigate"], ["看她不想走，自己偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「那我們去買點吃的吧。」", { "affection": 2, "normal_route": true }, "daily"]],
            'investigate': "舊校舍有老鼠竄過！她原本冷酷的臉瞬間破功，緊緊揪住你的衣角。\n「抓、抓緊我，別怕。我會保護你...就像以前一樣。」",
            'investigate_choices': [["笑著反握住她的手", { "affection": 3, "trust": 2 }], ["「妳以前也這麼怕老鼠嗎？」", { "curiosity": 2 }], ["被老鼠嚇到，丟下她跑走", { "fear": 3, "abandoned_partner": true }]],
            'follow': "你溜進舊校舍，發現她正拿著手電筒快速且熟練地檢查每個角落。\n她眉頭一皺：「你不該來這裡的...萬一想起來了怎麼辦？」",
            'follow_choices': [["「到底有什麼不能讓我想起來的！」", { "curiosity": 2, "courage": 1 }], ["「我不想妳一個人冒險。」", { "trust": 2, "affection": 2 }], ["覺得氣氛不妙，趕緊溜走", { "fear": 3, "abandoned_partner": true }]],
            'daily': "她懶洋洋地坐在長椅上，使喚你去買飲料跟食物。\n雖然態度高傲，但你看向她時，她會回以一個動人艷麗的輕笑。",
            'daily_choices': [["乖乖買來她愛吃的東西", { "affection": 3, "trust": 1 }], ["「妳為什麼要在意舊校舍的事？」", { "curiosity": 1, "fear": 1 }], ["不想當跑腿，直接丟下她離開", { "abandoned_partner": true }]],
            'aftermath_a': "安全脫離後，張栖鈴用濕紙巾幫你擦去臉上的泥土，語氣雖然依然不耐煩，但手卻有些顫抖：「真是個麻煩精...以後不准隨便離開本小姐的視線，聽見沒！」",
            'aftermath_a_choices': [["「好，我都聽妳的。」", { "affection": 2, "trust": 1 }], ["「妳的手抖得很厲害呢。」", { "fear": 1 }]],
            'aftermath_b': "事件過後，張栖鈴抱著手臂靠在牆上，有些驚魂未定但依然傲嬌地哼道：「剛剛...差點就沒命了。不過本小姐的反應還算快吧，你這下知道我的厲害了吧？」",
            'aftermath_b_choices': [["「是，妳最厲害了，謝謝妳。」", { "affection": 3, "trust": 2 }], ["「剛剛那個怪聲...好像真的不太對勁。」", { "curiosity": 2 }]],
            'aftermath_c': "安全後，張栖鈴紅著臉，緊緊揪住你的衣領，眼神亮晶晶地盯著你，豔麗的面容更顯嬌羞：「笨蛋...剛剛真的嚇死我了！以後不准再逞強了，因為...如果你不見了，就沒人幫我買奶茶了...」",
            'aftermath_c_choices': [["輕輕抱住她：「我答應妳，不會不見的。」", { "affection": 3, "trust": 2 }], ["「只是因為奶茶嗎？」", { "affection": 2, "curiosity": 1 }]],
            'memory': "你找到了一個機關複雜的機關盒，當年她懶得解開，是你興沖沖地解開卻引發了意外。\n張栖鈴冷哼了一聲，眼角卻帶著淚光：「算你還有點良心。以後可不准再忘記了，聽見沒？」",
            'memory_alt': "她看著煙火，無聊地打了個哈欠。\n「只要你平安開心就好...雖然照顧你真的很麻煩。」",
        },
        'f3': {
            'intro': "「喀嚓！」鎂光燈閃過，粉髮雙馬尾的少女拿著相機拍下你驚訝的臉。\n「哼！你果然回來了嘛！本小姐等你好久了！」",
            'intro_choices': [["無視她，轉身離開", { "affection": -1, "ice_route": true }], ["「刪掉照片！妳是跟蹤狂嗎？」", { "fear": 1, "mystery_route": true }], ["「妳拍我做什麼？我們認識？」", { "trust": 2, "curiosity": 1 }]],
            'lunch_a': "午休時，顧音棉突然跳到你面前，揮舞著手電筒，不滿地鼓起腮幫子：「哼！你昨天居然不理本小姐！今天我特地帶了特辣炒麵，要跟你比試！輸的人答應對方一件事！」",
            'lunch_a_choices': [["冷眼旁觀，不搭理競賽", { "affection": -1, "ice_route": true }], ["「妳說的事情，是指跟舊校舍有關嗎？」", { "curiosity": 1 }], ["「好啊，比就比，我才不怕辣！」", { "affection": 1, "trust": 1 }]],
            'lunch_b': "午休時，顧音棉神神秘秘地遞給你一張照片，指著上面的模糊黑影：「看！這是我用特製相機拍到的『舊校舍幽靈』照片！這黑影的形狀，是不是很像我們十年前的秘密基地？」",
            'lunch_b_choices': [["「這照片肯定是曝光過度，別胡說。」", { "fear": 1, "ice_route": true }], ["「幽靈照片？這跟磁場異常有關嗎？」", { "curiosity": 2, "mystery_route": true }], ["「這相機看起來很酷，是妳自己改裝的？」", { "affection": 2, "trust": 1 }]],
            'lunch_c': "午餐時間，顧音棉強行塞給你一個印著可愛貓咪的飯糰，俏皮地眨了眨眼：「這可是本小姐親手捏的超級大飯糰！作為交換，你的章魚燒分我吃一口，不准拒絕！」",
            'lunch_c_choices': [["「我不吃冷飯糰。」", { "affection": -1, "ice_route": true }], ["「妳是特地捏給我的，還是隨手拿的？」", { "curiosity": 1, "affection": 2 }], ["「哇！飯糰捏得好可愛，我們交換吃吧！」", { "affection": 2, "trust": 2 }]],
            'prep_a': "班會課後，顧音棉揮舞著她的『幽靈探測儀』湊過來：「雖然你一臉冰山，但探測儀顯示你身上的靈能值很高耶！今晚我們要不要去舊校舍抓鬼？」",
            'prep_a_choices': [["「我要回去讀書，別煩我。」", { "fear": 1, "ice_route": true }], ["「靈能值？這探測儀運作的原理是什麼？」", { "curiosity": 2 }], ["「如果探測儀不爆炸的話，可以考慮。」", { "affection": 2, "trust": 1 }]],
            'prep_b': "顧音棉完全無視上課鐘聲，神神秘密地拿出一盒線圈和指針：「我用幽靈探測儀監測到舊校舍附近有未知的電磁訊號。這絕對是靈界電波，今晚我們去抓鬼吧！」",
            'prep_b_choices': [["「電磁訊號只是基站干擾，別去了。」", { "fear": 1, "ice_route": true }], ["「靈界電波？我們帶上錄音設備去調查！」", { "curiosity": 2, "courage": 1, "mystery_route": true }], ["「要是被抓到，我們可是會被記過的哦。」", { "trust": 2, "affection": 1 }]],
            'prep_c': "顧音棉俏皮地拿出一對可愛的貓耳髮箍，直接扣在你的頭上，笑得直不起腰來：「哈哈哈，超適合你的！今天校園祭，你必須戴著這個跟我一起去逛街，這可是本小姐的特別命令！」",
            'prep_c_choices': [["摘下貓耳扔給她：「太丟臉了，我不戴。」", { "ice_route": true }], ["「戴著這個...大家都在看我們耶？」", { "curiosity": 2 }], ["「好吧，既然妳這麼高興，我就戴著陪妳吧。」", { "affection": 3, "trust": 2 }]],
            'rumor_a': "走廊上的置物櫃傳來異響。顧音棉開心地大叫，一把拉開櫃子，掉出一本舊漫畫。她鼓起腮幫子盯著你：「哼！這本漫畫十年前你借走就沒還！你這個賴帳的大冰山！」",
            'rumor_a_choices': [["「這不是我的，妳記錯了。」", { "trust": 1, "normal_route": true }], ["「漫畫最後一頁寫著『秘密約定』？」", { "curiosity": 2 }], ["「對不起啦，我買一本全新的還妳。」", { "affection": 2, "trust": 1 }]],
            'rumor_b': "顧音棉在廢棄櫃子裡拉出一條掛滿小鈴鐺的紅線。她興奮地指著紅線上的灰塵：「你看！這是我們以前做的『結界紅線』！這上面的鈴鐺還能響，這證明這裡的能量還在運轉！」",
            'rumor_b_choices': [["「這只是一根普通的毛線，別迷信了。」", { "fear": 2, "ice_route": true }], ["「鈴鐺的響聲頻率很低...這可能是聲波機關。」", { "curiosity": 3, "courage": 1, "mystery_route": true }], ["「這個小鈴鐺很精緻，妳當時也戴著一個吧？」", { "trust": 2, "affection": 1 }]],
            'rumor_c': "顧音棉在走廊拉開置物櫃，掉出一台壞掉的舊相機。她得意地抱著相機，眨了眨眼：「你看！這台相機的底片裡，還留著我們小時候大笑的合照呢！想看的話，今晚就乖乖聽本小姐的吩咐！」",
            'rumor_c_choices': [["「底片早就曝光壞掉了，我不想看。」", { "affection": -1, "ice_route": true }], ["「合照？我們是在哪裡拍的？」", { "curiosity": 2 }], ["「我都聽妳的，快帶我去洗照片吧！」", { "affection": 2, "trust": 2, "courage": 1 }]],
            'festival_a': "校園祭人山人海，顧音棉拿著相機有些不高興地鼓著臉：「大冰山，今天你都不配合本小姐拍照，快笑一個嘛，不然我就把你發呆的醜照洗出來貼在公告欄！」",
            'festival_a_choices': [["「我們直接去舊校舍抓鬼吧！」", { "courage": 1, "trust": 1 }, "investigate"], ["趁她玩得起勁，偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「慢點慢點，我們一攤一攤逛。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_b': "顧音棉興奮地搖晃著她的幽靈探測儀：「指針大暴走了！舊校舍的大門防護罩已經解除，我們衝啊，抓鬼大師出發！」",
            'festival_b_choices': [["「我們直接去舊校舍抓鬼吧！」", { "courage": 1, "trust": 1 }, "investigate"], ["趁她玩得起勁，偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「慢點慢點，我們一攤一攤逛。」", { "affection": 2, "normal_route": true }, "daily"]],
            'festival_c': "顧音棉興奮地在人群中橫衝直撞，一隻手死死拉著你的手：「快點快點！那邊有超好玩的攤位！不管啦，你今天必須一直牽著我，不准鬆開！」",
            'festival_c_choices': [["「我們直接去舊校舍抓鬼吧！」", { "courage": 1, "trust": 1 }, "investigate"], ["趁她玩得起勁，偷偷溜去舊校舍", { "fear": 1, "followed_target": true }, "follow"], ["「慢點慢點，我們一攤一攤逛。」", { "affection": 2, "normal_route": true }, "daily"]],
            'investigate': "她大膽地踹開舊校舍的門，結果差點被掉下來的吊燈砸到！\n她一把拉開你，自信地挺起胸膛：「有本小姐在怕什麼！我會保護你...就像以前一樣。」",
            'investigate_choices': [["「謝謝妳，妳真勇敢。」", { "affection": 3, "trust": 2 }], ["「以前妳也這麼衝動嗎？」", { "curiosity": 2 }], ["受不了她的危險行為，轉身就跑", { "fear": 3, "abandoned_partner": true }]],
            'follow': "你偷偷去舊校舍，發現她正在裡面對著空氣說話，好像在尋找什麼。\n她轉頭看到你，鼓起腮幫子：「你不該來這裡的...萬一想起來了，你會怪我的。」",
            'follow_choices': [["「妳到底在隱瞞什麼！」", { "curiosity": 2, "courage": 1 }], ["「不管發生什麼，我都不會怪妳。」", { "trust": 2, "affection": 2 }], ["覺得她在發神經，立刻逃走", { "fear": 3, "abandoned_partner": true }]],
            'daily': "她在攤位大吃特吃，還強迫你戴上奇怪的貓耳髮箍。\n看她俏皮靈動的笑顏，你覺得被她耍得團團轉似乎也不壞。",
            'daily_choices': [["笑著跟她一起瘋", { "affection": 3, "trust": 1 }], ["「妳為什麼突然對舊校舍失去興趣了？」", { "curiosity": 1, "fear": 1 }], ["覺得太丟臉，把貓耳扔給她走人", { "abandoned_partner": true }]],
            'aftermath_a': "危機解除後，顧音棉難得安靜下來，低頭擺弄著壞掉的相機，有些委屈：「這相機壞掉了...如果連我們的合照都拍不好，要怎麼讓你重新記起我啊...」",
            'aftermath_a_choices': [["「相機可以再修，別難過了。」", { "affection": 2, "trust": 1 }], ["「妳為什麼這麼在意我記不記得？」", { "curiosity": 2 }]],
            'aftermath_b': "安全脫離後，顧音棉興奮地蹦蹦跳跳，展示她拍到的神祕光斑：「哇！雖然剛才差點被砸到，但我拍到了超棒的光斑照片！本小姐今天也是超勇敢的對吧！」",
            'aftermath_b_choices': [["「是是是，妳最勇敢了。」", { "affection": 3, "trust": 2 }], ["「這光斑...會不會是感光元件壞了？」", { "curiosity": 2 }]],
            'aftermath_c': "安全後，顧音棉突然大哭著撲進你懷裡，粉色雙馬尾蹭得你胸口發癢。她緊緊抱著你，聲音顫抖：「笨蛋！剛才差點砸到你，嚇死本小姐了！你要是再出事，我...我就再也不理你了！」",
            'aftermath_c_choices': [["抱緊她：「沒事了，我這不是好好的嗎？」", { "affection": 3, "trust": 2 }], ["「大膽的抓鬼大師也會害怕啊？」", { "affection": 2, "curiosity": 1 }]],
            'memory': "你找到了一台手動舊相機。當年她為了拍「幽靈」給你看看，硬拉著你來探險，導致你跌落樓梯失去記憶。\n顧音棉大哭著撲進你懷裡：「笨蛋！你怎麼現在才想起來啦！害我一直提心吊膽的！」",
            'memory_alt': "煙火升空，她得意地拿著相機拍下煙火。\n「只要你平安開心就好...本小姐的技術不錯吧！」",
        },
    };

    // 生成完整節點
    for (let char_id in storylines) {
        const data = storylines[char_id];

        // intro
        nodes[`intro_${char_id}`] = {
            'text': data['intro'],
            'choices': data['intro_choices'].map((c, idx) => {
                const subRoute = idx === 0 ? 'a' : (idx === 1 ? 'b' : 'c');
                return { 'text': c[0], 'statChange': c[1], 'next': `lunch_${char_id}_${subRoute}` };
            })
        };

        // lunch_a, lunch_b, lunch_c, prep_a/b/c, rumor_a/b/c, festival_a/b/c
        ['a', 'b', 'c'].forEach(route => {
            nodes[`lunch_${char_id}_${route}`] = {
                'text': data[`lunch_${route}`],
                'choices': data[`lunch_${route}_choices`].map((c, idx) => {
                    const nextRoute = idx === 0 ? 'a' : (idx === 1 ? 'b' : 'c');
                    return { 'text': c[0], 'statChange': c[1], 'next': `prep_${char_id}_${nextRoute}` };
                })
            };

            nodes[`prep_${char_id}_${route}`] = {
                'text': data[`prep_${route}`],
                'choices': data[`prep_${route}_choices`].map((c, idx) => {
                    const nextRoute = idx === 0 ? 'a' : (idx === 1 ? 'b' : 'c');
                    return { 'text': c[0], 'statChange': c[1], 'next': `rumor_${char_id}_${nextRoute}` };
                })
            };

            nodes[`rumor_${char_id}_${route}`] = {
                'text': data[`rumor_${route}`],
                'choices': data[`rumor_${route}_choices`].map((c, idx) => {
                    const nextRoute = idx === 0 ? 'a' : (idx === 1 ? 'b' : 'c');
                    return { 'text': c[0], 'statChange': c[1], 'next': `festival_${char_id}_${nextRoute}` };
                })
            };

            nodes[`festival_${char_id}_${route}`] = {
                'text': data[`festival_${route}`],
                'choices': data[`festival_${route}_choices`].map(c => {
                    return { 'text': c[0], 'statChange': c[1], 'next': `${c[2]}_${char_id}` };
                })
            };
        });

        // investigate, follow, daily
        nodes[`investigate_${char_id}`] = {
            'text': data['investigate'],
            'choices': data['investigate_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `aftermath_${char_id}_b` }))
        };
        nodes[`follow_${char_id}`] = {
            'text': data['follow'],
            'choices': data['follow_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `aftermath_${char_id}_a` }))
        };
        nodes[`daily_${char_id}`] = {
            'text': data['daily'],
            'choices': data['daily_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `aftermath_${char_id}_c` }))
        };

        // aftermath_a, aftermath_b, aftermath_c
        ['a', 'b', 'c'].forEach(route => {
            nodes[`aftermath_${char_id}_${route}`] = {
                'text': data[`aftermath_${route}`],
                'choices': data[`aftermath_${route}_choices`].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': "eval_chapter3" }))
            };
        });

        let memoryText = char_id.startsWith('f') ? "「我都想起來了，對不起讓妳久等了。」" : "「我都想起來了，對不起讓你久等了。」";
        nodes[`memory_${char_id}`] = {
            'text': data['memory'],
            'choices': [
                { 'text': memoryText, 'statChange': { 'trust': 3, 'affection': 3, 'recovered_memory': true }, 'next': "eval_ending" },
                { 'text': "崩潰地質問：「為什麼要瞞著我！」", 'statChange': { 'fear': 3, 'affection': -2 }, 'next': "eval_ending" },
                { 'text': "無法承受事實，轉身逃跑", 'statChange': { 'abandoned_partner': true }, 'next': "eval_ending" }
            ]
        };
        nodes[`memory_alt_${char_id}`] = {
            'text': data['memory_alt'],
            'choices': [
                { 'text': "牽起手：「以後也一起來看煙火吧。」", 'statChange': { 'affection': 3, 'trust': 2 }, 'next': "eval_ending" },
                { 'text': "「我們...是不是小時候一起看過煙火？」", 'statChange': { 'trust': 3, 'recovered_memory': true }, 'next': "eval_ending" },
                { 'text': "假裝沒聽見", 'statChange': { 'abandoned_partner': true }, 'next': "eval_ending" }
            ]
        };
    }
    return nodes;
}

const storyNodes = buildStoryNodes();

const endings = {
    'm1': {
        'end_true': { 'title': "【TRUE END】約好的滑板特訓", 'desc': "你完全恢復了記憶。洛頁彥紅著眼眶抱住你，隨後笑著拿出準備已久的專屬滑板送給你：「對不起讓你久等了！這次，換我帶著你飛啦！」" },
        'end_good': { 'title': "【GOOD END】不再害怕的未來", 'desc': "雖然記憶沒有完全恢復，但他在夕陽下緊緊牽著你的手：「不管過去如何，從今以後的每一天，我都會像這樣陪著你、保護你！」" },
        'end_normal': { 'title': "【NORMAL END】吵鬧的日常", 'desc': "傳聞平息，洛頁彥又恢復了平時粗心大意的樣子，每天中午都吵著要你分他便當的配菜，過著吵鬧卻平凡的校園生活。" },
        'end_bad': { 'title': "【BAD END】破碎的頭盔", 'desc': "你在黑暗中因為恐懼而拋下他逃跑。當你帶著人回到舊校舍時，只在地上找到那頂充滿裂痕的舊頭盔，而洛頁彥再也沒有出現過。" },
        'end_comedy': { 'title': "【COMEDY END】滑板大暴走", 'desc': "因為你們的慌亂逃跑引發了校園祭大混亂，他情急之下踩著滑板帶你衝刺，最後直直撞進了校長室！兩人慘遭留校察看打掃廁所一個月。" }
    },
    'm2': {
        'end_true': { 'title': "【TRUE END】100%的奇蹟", 'desc': "記憶恢復，你解開了日記的密碼鎖。齊勻楠緊緊抱住你，聲音微顫：「你打破了我所有的風險計算與邏輯...但我心甘情願。」" },
        'end_good': { 'title': "【GOOD END】重新計算的戀愛", 'desc': "雖然記憶沒恢復，但他決定放下過去的執念，微笑著說：「看來我必須重新計算『如何讓你每天都心跳加速』的機率了。」" },
        'end_normal': { 'title': "【NORMAL END】平靜的數據", 'desc': "事件平息，齊勻楠依然每天精準計算著你的卡路里，你們維持著充滿邏輯卻略顯平淡的同學關係。" },
        'end_bad': { 'title': "【BAD END】無法計算的深淵", 'desc': "你不聽勸告走入黑暗，他爲了救你而被吞噬。幾天後，你收到了一份他生前寄出的、未完成的『舊校舍生存機率報告』。" },
        'end_comedy': { 'title': "【COMEDY END】完美計畫大崩壞", 'desc': "因為你的無厘頭舉動， his 紅外線感測器引發了全校防盜警報！你們被當成竊賊在操場被警衛狂追，他完美的形象徹底掃地。" }
    },
    'm3': {
        'end_true': { 'title': "【TRUE END】不再需要的醫藥箱", 'desc': "記憶恢復，秦陌寂摘下眼鏡，溫柔地輕吻你的額頭：「太好了，以後我不需要再為你準備OK繃，只要準備婚戒就好了。」" },
        'end_good': { 'title': "【GOOD END】溫暖的茶香", 'desc': "雖然沒恢復記憶，但他依然每天為你泡一杯安神茶。你們並肩坐在長椅上看著夕陽，享受著平靜且溫馨的陪伴。" },
        'end_normal': { 'title': "【NORMAL END】可靠的學長", 'desc': "事件結束，舊校舍被拆除。秦陌寂依然是你最可靠的學長，但你們之間始終保持著禮貌的距離。" },
        'end_bad': { 'title': "【BAD END】無盡的黑夜", 'desc': "恐懼讓你推開了他，獨自面對怪談。最後你在黑暗中失去了意識，再也喝不到學長親手泡的安神茶了。" },
        'end_comedy': { 'title': "【COMEDY END】校園祭最速傳說", 'desc': "你嚇得拉著他狂奔，結果文弱的他體力透支差點暈倒，最後被你一路用公主抱扛出校門，成為了全校師生目瞪口呆的傳奇。" }
    },
    'f1': {
        'end_true': { 'title': "【TRUE END】盛開的秘密花園", 'desc': "記憶恢復，你們一起重新整理了舊校舍後方的荒廢花園。田媛寧幸福地笑著：「這次，花朵一定會永遠盛開的，就像我們一樣。」" },
        'end_good': { 'title': "【GOOD END】新的花語", 'desc': "雖然沒恢復記憶，但她送給你一束代表「重新開始」的花朵，勇敢地主動牽起你的手迎向未來。" },
        'end_normal': { 'title': "【NORMAL END】寧靜的頂樓午餐", 'desc': "傳聞平息，你們依舊每天在頂樓分享手工便當，過著安穩、恬靜的普通校園生活。" },
        'end_bad': { 'title': "【BAD END】枯萎的約定", 'desc': "你因為害怕而逃跑，舊校舍的黑暗吞噬了一切，連同田媛寧一起消失。那座曾經承諾要一起照顧的花園，徹底荒蕪了。" },
        'end_comedy': { 'title': "【COMEDY END】貓咪大戰爭", 'desc': "逃跑時你不小心踩到她常餵的那隻流浪貓的尾巴，引發全校流浪貓集體暴走！你們被貓咪大軍追得抱頭鼠竄，狼狽不堪。" }
    },
    'f2': {
        'end_true': { 'title': "【TRUE END】解開的心鎖", 'desc': "機關盒與記憶同時解開。張栖鈴紅著臉撇過頭：「算你聰明...既然你想起來了，以後本小姐的奶茶，就交給你買一輩子了！」" },
        'end_good': { 'title': "【GOOD END】專屬跑腿員", 'desc': "雖然沒想起來，但她似乎更依賴你了。「發什麼呆？還不快去幫我買午餐，過來，牽著我的手一起去！」" },
        'end_normal': { 'title': "【NORMAL END】麻煩的日常", 'desc': "事件平息，她依舊每天霸佔交誼廳的沙發睡覺，而你依舊是那個常常被她呼之即來的跑腿同學。" },
        'end_bad': { 'title': "【BAD END】無法找回的寶物", 'desc': "你丟下她逃跑了。當你後悔回到舊校舍時，那裡只剩下一個永遠打不開的機關盒，而她再也沒有回來過。" },
        'end_comedy': { 'title': "【COMEDY END】女王的制裁", 'desc': "因為你丟下她逃跑，她氣得在全校廣播你的糗事，讓你徹底社會性死亡，最後你只好在操場當眾下跪求饒，成了全校笑柄。" }
    },
    'f3': {
        'end_true': { 'title': "【TRUE END】最完美的快門", 'desc': "記憶恢復，顧音棉破涕為笑，舉起修好的相機拍下你溫柔的笑容：「這張完美的照片，本小姐會當作傳家寶永遠珍藏的！」" },
        'end_good': { 'title': "【GOOD END】新的探險", 'desc': "雖然沒恢復記憶，但她馬上又發明了『戀愛探測儀』，每天跟在你身邊嘰嘰喳喳，你們展開了全新的熱鬧生活。" },
        'end_normal': { 'title': "【NORMAL END】和平的校園", 'desc': "舊校舍的傳聞消失了，她也覺得無趣而收起了幽靈探測儀，你們回歸了吵吵鬧鬧但和平的普通日常。" },
        'end_bad': { 'title': "【BAD END】底片上的黑影", 'desc': "你不信任她而獨自離開，最後在舊校舍深處迷失。幾天後，有人在地上發現了她的相機，裡面只洗出一張拍到可怕黑影的相片。" },
        'end_comedy': { 'title': "【COMEDY END】抓鬼大師的災難", 'desc': "逃跑時她的各種發明連環爆炸，把舊校舍炸得滿目瘡痍！你們兩人被迫穿著清潔服打掃了一整學期，還上了校刊頭版。" }
    }
};

// --- UI Flow Logic (Static Client Mode) ---

// Select Target Gender / Romance Type
function selectTargetGender(gender, event) {
    let relationType = 'HL';
    if (gender === 'male') {
        relationType = 'BL';
    } else if (gender === 'female') {
        relationType = 'GL';
    }
    
    gameState.relationType = relationType;
    console.log("選擇攻略對象性別:", gender, "對應故事類型:", relationType);

    const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = 'none';
    });

    const clickedBtn = event.currentTarget;
    clickedBtn.classList.add('selected');

    setTimeout(() => {
        if (relationType === 'BL') {
            gameState.playerGender = 'male';
            gameState.targetGender = 'male';
            gameState.resolvedTargetGender = 'male';
            gameState.resolvedPlayerGender = 'male';
            // BL goes straight to male character selection
            showCharacterSelection('male');
        } else if (relationType === 'GL') {
            gameState.playerGender = 'female';
            gameState.targetGender = 'female';
            gameState.resolvedTargetGender = 'female';
            gameState.resolvedPlayerGender = 'female';
            // GL goes straight to female character selection
            showCharacterSelection('female');
        } else if (relationType === 'HL') {
            // HL goes to player gender selection first
            showPlayerGenderSelection();
        }
    }, 600);
}

// Show Target Character Selection Screen
function showCharacterSelection(gender) {
    gameState.currentStep = 'targetCharacter';
    document.getElementById('target-gender-selection').classList.remove('active');
    document.getElementById('player-gender-selection').classList.remove('active');

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.display = 'block';
    }

    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';

    const chars = charactersData[gender];
    chars.forEach(char => {
        grid.appendChild(createCharacterCard(char));
    });

    setTimeout(() => {
        document.getElementById('target-character-selection').classList.add('active');
    }, 50);
}

// Create a character card element
function createCharacterCard(char) {
    const div = document.createElement('div');
    div.className = 'character-card';
    div.onclick = (e) => selectTargetCharacter(char.id, e);

    let infoHtml = '';
    if (char.id !== 'random_char') {
        infoHtml = `<div class="info-icon" onclick="showCharacterInfo('${char.id}', event)">🔍</div>`;
    }

    div.innerHTML = `
        <div class="char-image-placeholder">
            ${char.icon}
            ${infoHtml}
            <div class="char-name-banner">${char.name}</div>
        </div>
    `;
    return div;
}

// Select a target character
function selectTargetCharacter(charId, event) {
    gameState.targetCharacter = charId;

    const cards = document.querySelectorAll('#target-character-selection .character-card');
    cards.forEach(card => {
        card.classList.remove('selected');
        card.style.pointerEvents = 'none';
    });

    event.currentTarget.classList.add('selected');

    setTimeout(() => {
        resolveRandomSelections();
        showConfirmationScreen();
    }, 600);
}

// Show character info
function showCharacterInfo(charId, event) {
    event.stopPropagation();
    alert(`【展示人物介紹】\n這裡將在後續階段實作詳細 of ${charId} 介紹彈窗！`);
}

// Show Player Gender Selection Screen
function showPlayerGenderSelection() {
    gameState.currentStep = 'playerGender';

    document.getElementById('target-gender-selection').classList.remove('active');
    document.getElementById('target-character-selection').classList.remove('active');

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.display = 'block';
    }

    const randomBtn = document.getElementById('player-random-btn');
    if (randomBtn) {
        randomBtn.style.display = 'block';
    }

    setTimeout(() => {
        document.getElementById('player-gender-selection').classList.add('active');
    }, 50);
}

// Select Player Gender
function selectPlayerGender(gender, event) {
    gameState.playerGender = gender;

    const buttons = document.querySelectorAll('#player-gender-selection .choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = 'none';
    });

    event.currentTarget.classList.add('selected');

    setTimeout(() => {
        if (gameState.relationType === 'HL') {
            let resolvedPlayer;
            if (gender === 'random') {
                resolvedPlayer = Math.random() > 0.5 ? 'male' : 'female';
            } else {
                resolvedPlayer = gender;
            }
            gameState.resolvedPlayerGender = resolvedPlayer;

            const resolvedTarget = resolvedPlayer === 'male' ? 'female' : 'male';
            gameState.targetGender = resolvedTarget;
            gameState.resolvedTargetGender = resolvedTarget;

            showCharacterSelection(resolvedTarget);
        } else {
            resolveRandomSelections();
            showConfirmationScreen();
        }
    }, 600);
}

// Resolve Random Selections
function resolveRandomSelections() {
    // 1. Resolve Target Gender
    if (!gameState.resolvedTargetGender) {
        if (gameState.targetGender === 'random') {
            const genders = ['male', 'female'];
            gameState.resolvedTargetGender = genders[Math.floor(Math.random() * genders.length)];
        } else {
            gameState.resolvedTargetGender = gameState.targetGender;
        }
    }

    // 2. Resolve Target Character
    if (!gameState.targetCharacter || gameState.targetCharacter === 'random_char') {
        const chars = charactersData[gameState.resolvedTargetGender];
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        gameState.resolvedTargetCharacter = randomChar.id;
    } else {
        gameState.resolvedTargetCharacter = gameState.targetCharacter;
    }

    if (gameState.playerGender === 'random') {
        const genders = ['male', 'female'];
        gameState.resolvedPlayerGender = genders[Math.floor(Math.random() * genders.length)];
    } else {
        gameState.resolvedPlayerGender = gameState.playerGender;
    }
}

// Show Confirmation Screen
function showConfirmationScreen() {

    if (!gameState.resolvedTargetGender) {
        gameState.resolvedTargetGender = gameState.targetGender;
    }
    gameState.currentStep = 'confirmation';

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    const targetGenderGroup = charactersData[gameState.resolvedTargetGender];
    const targetCharData = targetGenderGroup.find(c => c.id === gameState.resolvedTargetCharacter);

    const targetCardHtml = `
        <div class="char-image-placeholder">
            ${targetCharData.icon}
            <div class="info-icon" onclick="showCharacterInfo('${targetCharData.id}', event)">🔍</div>
            <div class="char-name-banner">${targetCharData.name}</div>
        </div>
    `;
    document.getElementById('confirm-target-card').innerHTML = targetCardHtml;

    const playerIcon = gameState.resolvedPlayerGender === 'male' ? '👦' : '👧';
    const playerText = gameState.resolvedPlayerGender === 'male' ? '男性化身' : '女性化身';
    const playerCardHtml = `
        <div class="char-image-placeholder">
            ${playerIcon}
            <div class="char-name-banner">${playerText}</div>
        </div>
    `;
    document.getElementById('confirm-player-card').innerHTML = playerCardHtml;

    // Populate Detailed Infos and Random Extraction Results
    const targetGenderText = gameState.resolvedTargetGender === 'male' ? '男性' : '女性';
    let targetInfoHtml = `<div class="result-gender-line">性別：${targetGenderText}</div>`;
    if (gameState.targetGender === 'random') {
        targetInfoHtml += `<div class="random-result-badge">✨ 隨機抽取結果</div>`;
    } else if (gameState.targetCharacter === 'random_char') {
        targetInfoHtml += `<div class="random-result-badge">✨ 隨機角色結果</div>`;
    }
    document.getElementById('confirm-target-info').innerHTML = targetInfoHtml;

    const playerGenderText = gameState.resolvedPlayerGender === 'male' ? '男性' : '女性';
    let playerInfoHtml = `<div class="result-gender-line">性別：${playerGenderText}</div>`;
    if (gameState.playerGender === 'random') {
        playerInfoHtml += `<div class="random-result-badge">✨ 隨機抽取結果</div>`;
    }
    document.getElementById('confirm-player-info').innerHTML = playerInfoHtml;

    // 播放/還原背景音樂
    if (typeof playStaticBGM === 'function') {
        playStaticBGM('app/static/audio/bgm/sweet_intro.wav');
    }

    // 隱藏結局畫面，顯示故事畫面
    document.getElementById('ending-box').classList.add('hidden');
    document.getElementById('story-text').classList.remove('hidden');
    document.getElementById('choices').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('confirmation-screen').classList.add('active');
    }, 50);
}

// Start Game (proceed to Phase 2)
function startGame() {
    gameState.currentStep = 'game';

    const charPrefsStr = localStorage.getItem(`whispers_prefs_${gameState.resolvedTargetCharacter}`);
    if (charPrefsStr) {
        gameState.preferences = JSON.parse(charPrefsStr);
    } else {
        gameState.preferences = {
            npcColor: '#d6336c',
            playerColor: '#4facfe',
            textColor: '#ffffff',
            actionColor: '#b0b0b0'
        };
    }

    const p = gameState.preferences;
    document.documentElement.style.setProperty('--npc-dialogue-border', p.npcColor);
    document.documentElement.style.setProperty('--player-dialogue-border', p.playerColor);
    document.documentElement.style.setProperty('--dialogue-text-color', p.textColor);
    document.documentElement.style.setProperty('--action-text-color', p.actionColor);
    document.documentElement.style.setProperty('--npc-dialogue-bg', hexToRgba(p.npcColor, 0.1));
    document.documentElement.style.setProperty('--player-dialogue-bg', hexToRgba(p.playerColor, 0.1));

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('back-btn').style.display = 'none';
    const renderBtn = document.getElementById('render-btn');
    if (renderBtn) renderBtn.style.display = 'none';

    const targetCharData = charactersData[gameState.resolvedTargetGender].find(c => c.id === gameState.resolvedTargetCharacter);
    const charCardHtml = `
        <div class="char-image-placeholder">
            ${targetCharData.icon}
            <div class="info-icon" onclick="showCharacterInfo('${targetCharData.id}', event)">🔍</div>
            <div class="char-name-banner">${targetCharData.name}</div>
        </div>
    `;
    document.getElementById('game-character-card').innerHTML = charCardHtml;

    // 初始化故事播放設定與節點
    const charMap = {
        'A1': 'm1',
        'A2': 'm2',
        'A3': 'm3',
        'B1': 'f1',
        'B2': 'f2',
        'B3': 'f3'
    };
    gameState.targetKey = charMap[gameState.resolvedTargetCharacter] || 'm1';

    const historyContent = document.querySelector('.history-content');
    if (historyContent) {
        historyContent.innerHTML = '';
    }

    setTimeout(() => {
        document.getElementById('game-screen').classList.add('active');
        initScrollListener();

        // 進入角色對應的初始節點
        renderNode(`intro_${gameState.targetKey}`);
    }, 50);
}

// 初始化對話紀錄捲動監聽
function initScrollListener() {
    const historyPanel = document.getElementById('dialogue-history');
    const scrollBtn = document.getElementById('scroll-bottom-btn');
    if (historyPanel && scrollBtn) {
        historyPanel.onscroll = () => {
            if (historyPanel.scrollHeight - historyPanel.scrollTop - historyPanel.clientHeight > 50) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        };
    }
}

// 將對話紀錄捲至最底
function scrollToBottom() {
    const historyPanel = document.getElementById('dialogue-history');
    if (historyPanel) {
        historyPanel.scrollTo({
            top: historyPanel.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Show Exit Confirmation in Game Screen
function showExitConfirm() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');
}

// Handle Back Button Click
function handleBack() {
    if (gameState.currentStep === 'targetGender') {
        const modal = document.getElementById('confirm-modal');
        modal.classList.add('active');
    } else if (gameState.currentStep === 'targetCharacter') {
        document.getElementById('target-character-selection').classList.remove('active');
        if (gameState.relationType === 'HL') {
            setTimeout(() => {
                document.getElementById('player-gender-selection').classList.add('active');
            }, 300);
            gameState.currentStep = 'playerGender';

            const buttons = document.querySelectorAll('#player-gender-selection .choice-btn');
            buttons.forEach(btn => {
                btn.classList.remove('selected');
                btn.style.pointerEvents = 'auto';
            });
        } else {
            setTimeout(() => {
                document.getElementById('target-gender-selection').classList.add('active');
            }, 300);
            gameState.currentStep = 'targetGender';

            const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
            buttons.forEach(btn => {
                btn.classList.remove('selected');
                btn.style.pointerEvents = 'auto';
            });
        }
    } else if (gameState.currentStep === 'playerGender') {
        document.getElementById('player-gender-selection').classList.remove('active');
        setTimeout(() => {
            document.getElementById('target-gender-selection').classList.add('active');
        }, 300);
        gameState.currentStep = 'targetGender';

        const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.pointerEvents = 'auto';
        });
    } else if (gameState.currentStep === 'confirmation') {
        document.getElementById('confirmation-screen').classList.remove('active');
        setTimeout(() => {
            document.getElementById('target-character-selection').classList.add('active');
        }, 300);
        gameState.currentStep = 'targetCharacter';

        const cards = document.querySelectorAll('#target-character-selection .character-card');
        cards.forEach(card => {
            card.classList.remove('selected');
            card.style.pointerEvents = 'auto';
        });
    }
}

// Close Modal
function closeModal(event) {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('active');
}

// Return to Main Menu
function returnToMainMenu() {
    alert('【模擬返回主頁面】\n將在此處切換回遊戲主選單畫面！');
    closeModal();
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('game-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        overlay.classList.add('active');
    } else {
        sidebar.classList.add('collapsed');
        overlay.classList.remove('active');
    }
}

// Settings Modal Logic
function getBrightness(hex) {
    if (!hex.startsWith('#') || hex.length !== 7) return 255;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function hexToRgba(hex, alpha) {
    if (hex.length !== 7) return `rgba(255, 255, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function openSettingsModal() {
    const rootStyles = getComputedStyle(document.documentElement);
    let npcColor = rootStyles.getPropertyValue('--npc-dialogue-border').trim();
    let playerColor = rootStyles.getPropertyValue('--player-dialogue-border').trim();
    let textColor = rootStyles.getPropertyValue('--dialogue-text-color').trim();
    let actionColor = rootStyles.getPropertyValue('--action-text-color').trim();

    if (!npcColor.startsWith('#')) npcColor = '#d6336c';
    if (!playerColor.startsWith('#')) playerColor = '#4facfe';
    if (!textColor.startsWith('#')) textColor = '#ffffff';
    if (!actionColor.startsWith('#')) actionColor = '#b0b0b0';

    document.getElementById('npc-color-picker').value = npcColor;
    document.getElementById('player-color-picker').value = playerColor;
    document.getElementById('text-color-picker').value = textColor;
    document.getElementById('action-color-picker').value = actionColor;
    document.getElementById('settings-error').style.display = 'none';

    // Populate volume sliders
    const bgmVolInput = document.getElementById('static-slider-bgm');
    const sfxVolInput = document.getElementById('static-slider-sfx');
    if (bgmVolInput) bgmVolInput.value = staticBGMVolume;
    if (sfxVolInput) sfxVolInput.value = staticSFXVolume;

    document.getElementById('settings-modal').classList.add('active');
}

function closeSettingsModal(event) {
    if (event) event.stopPropagation();
    document.getElementById('settings-modal').classList.remove('active');
}

function saveSettings() {
    const npcColor = document.getElementById('npc-color-picker').value;
    const playerColor = document.getElementById('player-color-picker').value;
    const textColor = document.getElementById('text-color-picker').value;
    const actionColor = document.getElementById('action-color-picker').value;
    const errorMsg = document.getElementById('settings-error');

    if (npcColor.toLowerCase() === playerColor.toLowerCase()) {
        errorMsg.innerText = '防呆提示：雙方對話框顏色不得完全相同！';
        errorMsg.style.display = 'block';
        return;
    }

    if (getBrightness(textColor) <= getBrightness(actionColor)) {
        errorMsg.innerText = '防呆提示：一般文字顏色必須比動作文字更顯眼(亮度較高)！';
        errorMsg.style.display = 'block';
        return;
    }

    // Save volume configuration
    const bgmVolInput = document.getElementById('static-slider-bgm');
    const sfxVolInput = document.getElementById('static-slider-sfx');
    if (bgmVolInput) {
        staticBGMVolume = parseFloat(bgmVolInput.value);
        localStorage.setItem('whispers_static_bgm_volume', staticBGMVolume);
        if (staticBGM) {
            staticBGM.volume = staticBGMVolume;
        }
    }
    if (sfxVolInput) {
        staticSFXVolume = parseFloat(sfxVolInput.value);
        localStorage.setItem('whispers_static_sfx_volume', staticSFXVolume);
    }

    gameState.preferences = {
        npcColor: npcColor,
        playerColor: playerColor,
        textColor: textColor,
        actionColor: actionColor
    };

    if (gameState.resolvedTargetCharacter) {
        localStorage.setItem(`whispers_prefs_${gameState.resolvedTargetCharacter}`, JSON.stringify(gameState.preferences));
    }

    document.documentElement.style.setProperty('--npc-dialogue-border', npcColor);
    document.documentElement.style.setProperty('--player-dialogue-border', playerColor);
    document.documentElement.style.setProperty('--dialogue-text-color', textColor);
    document.documentElement.style.setProperty('--action-text-color', actionColor);

    document.documentElement.style.setProperty('--npc-dialogue-bg', hexToRgba(npcColor, 0.1));
    document.documentElement.style.setProperty('--player-dialogue-bg', hexToRgba(playerColor, 0.1));

    closeSettingsModal();
}

// 動態格式化對話文字
function formatDialogueText(text) {
    return text.replace(/(\(.*?\)|（.*?）)/g, '<span class="action-text">$1</span>');
}

// ==================== 存檔與讀檔系統 ====================
let currentSaveLoadMode = 'save';
const MAX_SAVE_SLOTS = 3;

function openSaveLoadModal(mode) {
    currentSaveLoadMode = mode;
    document.getElementById('saveload-title').innerText = mode === 'save' ? '選擇存檔欄位' : '選擇讀檔欄位';

    const container = document.getElementById('saveload-slots-container');
    container.innerHTML = '';

    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
        const slotData = localStorage.getItem(`whispers_save_${i}`);
        const slotEl = document.createElement('div');

        if (slotData) {
            const data = JSON.parse(slotData);
            const dateStr = new Date(data.timestamp).toLocaleString();
            let targetName = '未知';
            if (data.resolvedTargetGender && data.resolvedTargetCharacter) {
                const charData = charactersData[data.resolvedTargetGender].find(c => c.id === data.resolvedTargetCharacter);
                if (charData) targetName = charData.name;
            }

            slotEl.className = 'save-slot';
            slotEl.innerHTML = `
                <div class="save-info-row">
                    <strong>Slot ${i} - 攻略對象: ${targetName}</strong>
                    <span class="save-date">${dateStr}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-dim);">
                    點擊以${mode === 'save' ? '覆蓋存檔' : '讀取進度'}
                </div>
            `;
        } else {
            slotEl.className = 'save-slot empty';
            slotEl.innerHTML = `<div>Slot ${i} - 空白欄位</div>`;
            if (mode === 'load') {
                slotEl.style.pointerEvents = 'none';
                slotEl.style.opacity = '0.3';
            }
        }

        slotEl.onclick = () => handleSaveLoadSlot(i);
        container.appendChild(slotEl);
    }

    document.getElementById('saveload-modal').classList.add('active');
}

function closeSaveLoadModal(event) {
    if (event) event.stopPropagation();
    document.getElementById('saveload-modal').classList.remove('active');
}

function handleSaveLoadSlot(slotId) {
    if (currentSaveLoadMode === 'save') {
        const saveData = {
            ...gameState,
            timestamp: Date.now()
        };
        localStorage.setItem(`whispers_save_${slotId}`, JSON.stringify(saveData));
        alert(`已成功儲存進度與偏好設定至 Slot ${slotId}`);
        closeSaveLoadModal();
    } else {
        const slotData = localStorage.getItem(`whispers_save_${slotId}`);
        if (slotData) {
            const parsedData = JSON.parse(slotData);
            Object.assign(gameState, parsedData);

            if (gameState.preferences) {
                const p = gameState.preferences;
                document.documentElement.style.setProperty('--npc-dialogue-border', p.npcColor);
                document.documentElement.style.setProperty('--player-dialogue-border', p.playerColor);
                document.documentElement.style.setProperty('--dialogue-text-color', p.textColor);
                document.documentElement.style.setProperty('--action-text-color', p.actionColor);

                document.documentElement.style.setProperty('--npc-dialogue-bg', hexToRgba(p.npcColor, 0.1));
                document.documentElement.style.setProperty('--player-dialogue-bg', hexToRgba(p.playerColor, 0.1));
            }

            alert(`已讀取 Slot ${slotId} 的進度與設定！`);
            closeSaveLoadModal();

            if (gameState.currentStep === 'game') {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById('game-screen').classList.add('active');

                const targetCharData = charactersData[gameState.resolvedTargetGender].find(c => c.id === gameState.resolvedTargetCharacter);
                const charCardHtml = `
                    <div class="char-image-placeholder">
                        ${targetCharData.icon}
                        <div class="info-icon" onclick="showCharacterInfo('${targetCharData.id}', event)">🔍</div>
                        <div class="char-name-banner">${targetCharData.name}</div>
                    </div>
                `;
                document.getElementById('game-character-card').innerHTML = charCardHtml;

                // 還原當前故事節點
                if (gameState.currentNode) {
                    const historyContent = document.querySelector('.history-content');
                    if (historyContent) {
                        historyContent.innerHTML = '';
                    }
                    renderNode(gameState.currentNode);
                } else {
                    scrollToBottom();
                }
            }
        }
    }
}

// --- Story Engine Logic ---

function renderNode(nodeId) {
    // 處理章節邏輯跳轉
    if (nodeId === 'eval_chapter3') {
        let tKey = gameState.targetKey;
        if (!tKey) tKey = 'm1'; // 防呆
        if (gameState.stats.curiosity >= 2 || gameState.flags.followed_target) {
            nodeId = `memory_${tKey}`;
        } else {
            nodeId = `memory_alt_${tKey}`;
        }
    }

    // 處理結局跳轉
    if (nodeId === 'eval_ending') {
        showEnding();
        return;
    }

    gameState.currentNode = nodeId;
    const node = storyNodes[nodeId];

    if (!node) {
        console.error("劇情載入錯誤！找不到節點: " + nodeId);
        return;
    }

    // 渲染對話到對話紀錄面板
    const historyContent = document.querySelector('.history-content');
    if (historyContent) {
        const dialogLine = document.createElement('div');
        dialogLine.className = 'dialogue-line npc';
        dialogLine.style.display = 'flex';
        dialogLine.style.alignItems = 'flex-start';
        dialogLine.style.gap = '15px';
        
        let speakerName = "對方";
        if (gameState.targetKey && characters[gameState.targetKey]) {
            speakerName = characters[gameState.targetKey].name;
        }

        const formattedText = formatDialogueText(node.text);
        let avatarHtml = '';
        if (gameState.targetKey) {
            avatarHtml = `<img src="${getCharacterImageUrl(gameState.targetKey)}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--npc-dialogue-border);" alt="${speakerName}">`;
        }
        dialogLine.innerHTML = `
            ${avatarHtml}
            <div style="flex: 1;">
                <span class="speaker">${speakerName}</span>
                <div style="margin-top: 5px;">${formattedText}</div>
            </div>
        `;
        historyContent.appendChild(dialogLine);
        scrollToBottom();
    }

    // 渲染選項到 choices-list
    const choicesList = document.querySelector('.choices-list');
    if (choicesList) {
        choicesList.innerHTML = '';
        node.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            btn.onclick = () => {
                const historyContent = document.querySelector('.history-content');
                if (historyContent) {
                    const pLine = document.createElement('p');
                    pLine.className = 'dialogue-line player';
                    pLine.innerHTML = `<span class="speaker">你</span>${choice.text}`;
                    historyContent.appendChild(pLine);
                    scrollToBottom();
                }
                makeChoice(choice);
            };
            choicesList.appendChild(btn);
        });
    }
}

function makeChoice(choice) {
    if (choice.targetKey) {
        gameState.targetKey = choice.targetKey;
    }

    if (choice.statChange) {
        for (let key in choice.statChange) {
            if (typeof choice.statChange[key] === 'boolean') {
                gameState.flags[key] = choice.statChange[key];
            } else {
                if (!gameState.stats[key]) gameState.stats[key] = 0;
                gameState.stats[key] += choice.statChange[key];
            }
        }
    }

    renderNode(choice.next);
}

function showEnding() {
    // 隱藏返回按鈕與側邊欄，防止結局畫面消失或被導向走
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.style.display = 'none';
    const renderBtn = document.getElementById('render-btn');
    if (renderBtn) renderBtn.style.display = 'none';
    const gameSidebar = document.getElementById('game-sidebar');
    if (gameSidebar) gameSidebar.style.display = 'none';

    let endKey = 'end_normal';
    const stats = gameState.stats;
    const flags = gameState.flags;

    // 結局判定邏輯
    if (flags.abandoned_partner) {
        if (stats.fear >= 2) {
            endKey = 'end_bad';
        } else {
            endKey = 'end_comedy';
        }
    } else if (flags.recovered_memory && stats.trust >= 2 && stats.affection >= 2) {
        endKey = 'end_true';
    } else if (stats.affection >= 2 && stats.trust >= 1) {
        endKey = 'end_good';
    }

    const targetKey = gameState.targetKey || 'm1';
    let ending = endings[targetKey][endKey];
    if (!ending) ending = endings['m1']['end_normal']; // 預設防呆

    // 切換結局背景音樂
    let endingBgm = 'app/static/audio/bgm/sweet_intro.wav';
    if (endKey === 'end_true' || endKey === 'end_good') {
        endingBgm = 'app/static/audio/bgm/romantic_piano.wav';
    } else if (endKey === 'end_bad') {
        endingBgm = 'app/static/audio/bgm/tension_loop.wav';
    }
    if (typeof playStaticBGM === 'function') {
        playStaticBGM(endingBgm);
    }

    // 切換畫面
    const storyText = document.getElementById('story-text');
    if (storyText) storyText.classList.add('hidden');
    const choices = document.getElementById('choices');
    if (choices) choices.classList.add('hidden');

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const endingBox = document.getElementById('ending-box');
    if (endingBox) {
        endingBox.classList.add('active');
        endingBox.classList.remove('hidden');
    }

    const endingTitle = document.getElementById('ending-title');
    if (endingTitle) endingTitle.innerText = ending.title;
    const endingDesc = document.getElementById('ending-desc');
    if (endingDesc) endingDesc.innerText = ending.desc;
}

// --- 靜態離線版音訊系統 ---
let staticBGM = null;
let audioUnlocked = false;

let staticBGMVolume = 0.5;
let staticSFXVolume = 0.8;
try {
    const cachedBGM = localStorage.getItem('whispers_static_bgm_volume');
    if (cachedBGM !== null) staticBGMVolume = parseFloat(cachedBGM);
    const cachedSFX = localStorage.getItem('whispers_static_sfx_volume');
    if (cachedSFX !== null) staticSFXVolume = parseFloat(cachedSFX);
} catch (e) {
    console.error("Failed to load volume preferences:", e);
}

function playStaticBGM(src) {
    if (!src) return;

    // 如果已經在播放同一首，不要重新播放
    if (staticBGM && staticBGM.src.endsWith(src)) {
        if (staticBGM.paused && audioUnlocked) {
            staticBGM.play().catch(err => console.log("BGM play error:", err));
        }
        return;
    }

    if (staticBGM) {
        staticBGM.pause();
    }

    staticBGM = new Audio(src);
    staticBGM.loop = true;
    staticBGM.volume = staticBGMVolume;
    
    if (audioUnlocked) {
        staticBGM.play().catch(err => console.log("BGM play error:", err));
    }
}

function playStaticSFX(src) {
    if (!src) return;
    const sfx = new Audio(src);
    sfx.volume = staticSFXVolume;
    if (audioUnlocked) {
        sfx.play().catch(err => console.log("SFX play error:", err));
    }
}

function unlockStaticAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    if (staticBGM && staticBGM.paused) {
        staticBGM.play().catch(err => console.log("BGM play error:", err));
    }
}

function setupStaticAudio() {
    const handleInteraction = () => {
        unlockStaticAudio();
        if (!staticBGM) {
            playStaticBGM('app/static/audio/bgm/sweet_intro.wav');
        }
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    // 全域懸停與點擊音效事件代理
    const clickableSelectors = 'button, a, .choice-btn, .back-btn, .icon-btn, .modal-btn, [role="button"]';

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(clickableSelectors);
        if (target) {
            if (e.relatedTarget && target.contains(e.relatedTarget)) return;
            playStaticSFX('app/static/audio/sfx/bubble_hover.wav');
        }
    });

    document.addEventListener('click', (e) => {
        const target = e.target.closest(clickableSelectors);
        if (target) {
            playStaticSFX('app/static/audio/sfx/select_confirm.wav');
        }
    });
}

// 初始化/重置遊戲狀態與UI
function initGame() {
    gameState = {
        currentStep: 'targetGender',
        targetGender: null,
        targetCharacter: null,
        playerGender: null,
        resolvedTargetGender: null,
        resolvedTargetCharacter: null,
        resolvedPlayerGender: null,
        preferences: {
            npcColor: '#d6336c',
            playerColor: '#4facfe',
            textColor: '#ffffff',
            actionColor: '#b0b0b0'
        },
        currentNode: 'start',
        targetKey: null,
        stats: {
            trust: 0, curiosity: 0, fear: 0, affection: 0, courage: 0
        },
        flags: {
            mystery_route: false, ice_route: false, normal_route: false,
            followed_target: false, recovered_memory: false, abandoned_partner: false
        }
    };

    // 隱藏結局畫面與遊戲畫面，還原選擇畫面
    const endingBox = document.getElementById('ending-box');
    if (endingBox) endingBox.classList.add('hidden');

    const storyText = document.getElementById('story-text');
    if (storyText) storyText.classList.remove('hidden');

    const choices = document.getElementById('choices');
    if (choices) choices.classList.remove('hidden');

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    const targetGenderSelection = document.getElementById('target-gender-selection');
    if (targetGenderSelection) targetGenderSelection.classList.add('active');

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.display = 'none'; // 初始頁面隱藏返回按鈕
    }

    const renderBtn = document.getElementById('render-btn');
    if (renderBtn) {
        renderBtn.style.display = 'flex'; // 顯示線上版按鈕
    }

    const gameSidebar = document.getElementById('game-sidebar');
    if (gameSidebar) {
        gameSidebar.style.display = 'block'; // 確保側邊欄回到預設狀態
        gameSidebar.classList.add('collapsed');
    }

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = 'auto';
    });

    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.classList.remove('selected');
        card.style.pointerEvents = 'auto';
    });
}

// 綁定事件並啟動遊戲
window.onload = () => {
    setupStaticAudio();
    document.getElementById('restart-btn').onclick = initGame;
    initGame();
};
