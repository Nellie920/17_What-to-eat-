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

// Character Data (for Selection Screen)
const charactersData = {
    male: [
        { id: 'A1', name: '洛頁彥', icon: '👦' },
        { id: 'A2', name: '齊勻楠', icon: '🧑' },
        { id: 'A3', name: '秦陌寂', icon: '👨' }
    ],
    female: [
        { id: 'B1', name: '田媛寧', icon: '👧' },
        { id: 'B2', name: '張栖鈴', icon: '👩' },
        { id: 'B3', name: '顧音棉', icon: '👱‍♀️' }
    ]
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
                { 'text': "男女戀 (BG)", 'next': "select_target_f" }
            ]
        },
        'node_hl_gender': {
            'text': "請選擇你想扮演的性別：",
            'choices': [
                { 'text': "扮演男生 (對象為女性)", 'next': "select_target_f" },
                { 'text': "扮演女生 (對象為男性)", 'next': "select_target_m" },
                { 'text': "交給命運決定 (隨機)", 'next': "select_target_f" } // 簡化處理
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
            'intro_choices': [
                ["「你認錯人了，借過。」", { 'affection': -1, 'ice_route': true }],
                ["「你怎麼知道我回來了？」", { 'fear': 1, 'mystery_route': true }],
                ["「小心點啊，你誰？」", { 'trust': 2, 'curiosity': 1 }]
            ],
            'lunch': "隔天中午，洛頁彥毫不客氣地坐到你對面，甚至想偷夾你便當裡的配菜。\n「欸嘿，這個看起來好好吃！作為交換，本大爺的超大炸豬排分你一塊吧！」",
            'lunch_choices': [
                ["「謝謝，我們一起吃吧。」", { 'affection': 2, 'trust': 1 }],
                ["「不要隨便碰別人的食物！」", { 'fear': 1 }],
                ["默默把配菜夾給他，不發一語", { 'affection': 1, 'ice_route': true }]
            ],
            'prep': "吃完午餐，洛頁彥拿著一罐奇怪的能量飲料湊過來，神神秘秘地說：\n「對了，聽說舊校舍晚上會鬧鬼，聽起來超酷的對吧！我們要不要去探險？」",
            'prep_choices': [
                ["「聽起來很有趣，一起去？」", { 'affection': 2, 'trust': 1 }],
                ["「鬧鬼？你調查過了嗎？」", { 'curiosity': 2, 'fear': 1 }],
                ["「無聊，不想理你。」", { 'fear': 1, 'ice_route': true }]
            ],
            'rumor': "放學後，你們在走廊聽到置物櫃傳來奇怪的抓撓聲。\n洛頁彥大膽地直接把櫃子扯開，裡面掉出一本沾滿灰塵的舊筆記，上面畫著舊校舍的地圖。",
            'rumor_choices': [
                ["「我們打開來看看寫了什麼。」", { 'curiosity': 2, 'courage': 1 }],
                ["「這太詭異了，把它丟掉。」", { 'fear': 2 }],
                ["「拿去給老師處理吧。」", { 'trust': 1, 'normal_route': true }]
            ],
            'festival': "校園祭到了，洛頁彥興奮地拉著你到處跑。\n「走吧走吧！不管前面有什麼，本大爺都會帶著你衝過去的！」他不由分說地往舊校舍的方向跑去。",
            'festival_choices': [
                ["「好，我們去舊校舍探險！」", { 'courage': 1, 'trust': 1 }, "investigate"],
                ["偷偷跟在他後面看他要幹嘛", { 'fear': 1, 'followed_target': true }, "follow"],
                ["「不去，我們去吃章魚燒。」", { 'affection': 2, 'normal_route': true }, "daily"]
            ],
            'investigate': "你們踢開舊校舍的門，結果洛頁彥踩空了木板！\n「危險！」他粗心地跌倒，卻在墜落前死命護住你：\n「別怕！這次換我來保護你...就像以前一樣！」",
            'investigate_choices': [
                ["緊緊抓著他：「我不怕！」", { 'affection': 3, 'trust': 2 }],
                ["「以前到底發生過什麼？」", { 'curiosity': 2 }],
                ["嚇得甩開他逃跑", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'follow': "你偷偷跟著他，發現他在舊校舍牆壁上塗鴉驅邪符號。\n他一轉頭看到你，嚇了一跳：「你不該來這裡的...萬一你想起來怎麼辦？」",
            'follow_choices': [
                ["「把你知道的全部告訴我！」", { 'curiosity': 2, 'courage': 1 }],
                ["「我只是擔心你...」", { 'trust': 2, 'affection': 2 }],
                ["覺得他是怪人，轉身逃跑", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'daily': "你們在攤位狂吃，他笑得像個孩子。\n「哈哈哈，太好吃了！如果每天都能這樣就好了...」他的笑容裡卻閃過一絲落寞。",
            'daily_choices': [
                ["把最後一顆章魚燒餵給他", { 'affection': 3, 'trust': 1 }],
                ["「你為什麼一直避開舊校舍？」", { 'curiosity': 1, 'fear': 1 }],
                ["嫌他吃相太難看，自己先走", { 'abandoned_partner': true }]
            ],
            'aftermath': "經過剛才的混亂，你們在安靜 the 樓梯間喘氣。\n洛頁彥收起平時嘻笑的模樣，認真地看著你：「你沒受傷吧？我...我真的很怕又失去你。」",
            'aftermath_choices': [
                ["「我沒事，別擔心。」", { 'affection': 2, 'trust': 1 }],
                ["「你到底在害怕什麼？」", { 'curiosity': 2 }],
                ["靠在他的肩膀上休息", { 'affection': 3, 'trust': 2 }]
            ],
            'memory': "在廢棄教室，你找到一個生鏽的滑板頭盔。當年你差點從二樓摔下，是他墊在你身下，頭盔上的裂痕就是證明。\n洛頁彥紅著眼眶：「對不起讓你久等了！我一直都在這裡喔！」",
            'memory_alt': "煙火升空，洛頁彥看著天空，艷紅的頭髮隨風飄動。\n「要是能一直這樣開心就好了...對吧？」"
        },
        'm2': {
            'intro': "走廊上，一名黑髮少年正拿著捲尺測量距離。他停下動作，深邃的眼神鎖定你。\n「……你果然回來了。誤差不到一天，剛好是約定好的日子。」",
            'intro_choices': [
                ["「約定？你在說什麼？」", { 'trust': 2, 'curiosity': 1 }],
                ["「你在監視我嗎？」", { 'fear': 1, 'mystery_route': true }],
                ["「神經病。」直接走人", { 'affection': -1, 'ice_route': true }]
            ],
            'lunch': "午餐時間，齊勻楠拿出一個營養完美均衡的便當，並開始默默計算你餐盒裡的卡路里。\n「你今天的蛋白質攝取量不足，這塊雞胸肉給你，這是我計算過最理想的份量。」",
            'lunch_choices': [
                ["「謝謝你的計算，那我就收下了。」", { 'affection': 2, 'trust': 1 }],
                ["「你管太多了吧？」", { 'fear': 1 }],
                ["故意把不健康的零食塞給他", { 'affection': 2, 'curiosity': 1 }]
            ],
            'prep': "班會課後，齊勻楠遞給你一份完美的『舊校舍怪談分析報告』。\n「我們需要用邏輯解決這個問題，晚上別靠近那裡，風險機率高達98%。」",
            'prep_choices': [
                ["「你真細心，謝謝。」", { 'affection': 2, 'trust': 1 }],
                ["「這報告...你調查多久了？」", { 'curiosity': 2, 'fear': 1 }],
                ["「我不想看這些。」", { 'fear': 1, 'ice_route': true }]
            ],
            'rumor': "他把你帶到電腦教室，駭入了學校舊論壇的隱藏板塊。\n螢幕上顯示著十年前的一篇匿名貼文：「不要去舊校舍找那個東西...會被帶走的。」",
            'rumor_choices': [
                ["「我們印出來當作線索吧。」", { 'curiosity': 2, 'courage': 1 }],
                ["「這太詭異了，把它丟掉。」", { 'fear': 2 }],
                ["「你為什麼對這件事這麼執著？」", { 'trust': 2, 'curiosity': 1 }]
            ],
            'festival': "校園祭時，他拿出了一張規劃好完美避開人潮的地圖。\n「跟緊我，這裡人多，別走散了。特別是別靠近北棟舊校舍。」",
            'festival_choices': [
                ["「但我偏想去舊校舍看看！」", { 'courage': 1, 'trust': 1 }, "investigate"],
                ["假裝去洗手間，偷偷溜去舊校舍", { 'fear': 1, 'followed_target': true }, "follow"],
                ["「好，我跟著你走。」", { 'affection': 2, 'normal_route': true }, "daily"]
            ],
            'investigate': "舊校舍突然停電，齊勻楠立刻抽出準備好的手電筒，將你護在身後。\n「退後。我會保護你...就像以前一樣。」",
            'investigate_choices': [
                ["躲在他寬闊的背後", { 'affection': 3, 'trust': 2 }],
                ["「以前也停電過嗎？」", { 'curiosity': 2 }],
                ["太黑了，嚇得往外衝", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'follow': "你偷偷庫去舊校舍，發現他正在安裝紅外線感測器。\n他無奈地嘆氣：「你不該來這裡的...萬一記憶被刺激而想起來...」",
            'follow_choices': [
                ["「把你知道的全部告訴我！」", { 'curiosity': 2, 'courage': 1 }],
                ["「我只是想跟你在一起。」", { 'trust': 2, 'affection': 2 }],
                ["覺得太危險，逃離現場", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'daily': "你們完美地逛完了所有攤位，享受了沒有排隊的完美祭典。\n他看著你開心的樣子，嘴角揚起溫柔的酒窩。",
            'daily_choices': [
                ["「跟你在一起真好。」", { 'affection': 3, 'trust': 1 }],
                ["「你為什麼一直避開舊校舍？」", { 'curiosity': 1, 'fear': 1 }],
                ["覺得行程太死板，自己跑掉", { 'abandoned_partner': true }]
            ],
            'aftermath': "逃離險境後，他用隨身的醫療手電筒仔細檢查你是否受傷，他的手指微微顫抖著。\n「我計算了所有的風險機率...卻沒算到我看到你遇險時會有多恐慌。」",
            'aftermath_choices': [
                ["握住他顫抖的手", { 'affection': 3, 'trust': 2 }],
                ["「原來你也會慌張啊？」", { 'affection': 2, 'curiosity': 1 }],
                ["抽回手，保持距離", { 'fear': 1, 'ice_route': true }]
            ],
            'memory': "你找到一本上了密碼鎖的日記，密碼是你的生日。裡面寫滿了他為了尋找讓你恢復記憶的方法，研究舊校舍多年的紀錄。\n齊勻楠握緊你的手：「我也想起來了...這一次，我不會再放手。」",
            'memory_alt': "煙火綻放，他早已計算好最佳的觀賞角度。\n「只要你平安開心就好...其他的，我來承擔。」"
        },
        'm3': {
            'intro': "你不小心撞落了書本，一名戴著銀框眼鏡的棕髮學長溫柔地幫你撿起。\n他推了推眼鏡，露出安心的微笑：「太好了，你果然回來了。這不是夢吧？」",
            'intro_choices': [
                ["「學長...我們認識嗎？」", { 'trust': 2, 'curiosity': 1 }],
                ["「你怎麼知道我是誰？」", { 'fear': 1, 'mystery_route': true }],
                ["拿過書，沉默離開", { 'affection': -1, 'ice_route': true }]
            ],
            'lunch': "午休時，秦陌寂提著一個精美的日式雙層便當盒走向你。\n「我自己做了一些小菜，如果不嫌棄的話，要不要一起吃？」他斯文地笑著。",
            'lunch_choices': [
                ["「哇，學長手藝真好！謝謝！」", { 'affection': 2, 'trust': 1 }],
                ["「不用了，我自己有買。」", { 'fear': 1, 'ice_route': true }],
                ["夾起一口菜直接餵給他", { 'affection': 3, 'courage': 1 }]
            ],
            'prep': "班會時間，秦陌寂特地為你泡了一杯安神茶。\n「聽說最近舊校舍有傳聞，你沒被嚇得睡不著吧？有事隨時來找我。」",
            'prep_choices': [
                ["「學長真體貼，謝謝你。」", { 'affection': 2, 'trust': 1 }],
                ["「學長似乎對那傳聞很了解？」", { 'curiosity': 2, 'fear': 1 }],
                ["「我不需要這種關心。」", { 'fear': 1, 'ice_route': true }]
            ],
            'rumor': "你們一起在圖書館找資料，窗外突然颳起一陣陰冷的風，吹翻了關於校史的書。\n秦陌寂默默將他的外套披在你肩上，看著窗外的舊校舍，眼神深邃。",
            'rumor_choices': [
                ["「謝謝學長，好溫暖。」", { 'affection': 2, 'trust': 1 }],
                ["「學長在看什麼？」", { 'curiosity': 2 }],
                ["把外套還給他", { 'ice_route': true, 'fear': 1 }]
            ],
            'festival': "他帶你到一個安靜的茶藝攤位。\n「別擔心，我已經把晚上的行程都規劃好了，放鬆享受吧。」但他不時擔憂地望向舊校舍。",
            'festival_choices': [
                ["「學長，我們去舊校舍看看吧！」", { 'courage': 1, 'trust': 1 }, "investigate"],
                ["趁他不注意，偷偷前往舊校舍", { 'fear': 1, 'followed_target': true }, "follow"],
                ["「好，我們就在這喝茶。」", { 'affection': 2, 'normal_route': true }, "daily"]
            ],
            'investigate': "舊校舍傳出怪聲，一堆蝙蝠飛出！秦陌寂冷靜地用外套護住你。\n「深呼吸，沒事的。我會保護你...就像以前一樣。」",
            'investigate_choices': [
                ["靠在他懷裡感到無比安心", { 'affection': 3, 'trust': 2 }],
                ["「以前你也這樣保護過我？」", { 'curiosity': 2 }],
                ["推開他崩潰逃跑", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'follow': "你偷偷前往舊校舍，發現他正在清理地上的碎玻璃。\n他看到你，眼神閃過一絲痛苦：「你不該來這裡的...會想起來那段可怕的記憶的。」",
            'follow_choices': [
                ["「我必須知道真相！」", { 'curiosity': 2, 'courage': 1 }],
                ["「只要有學長在就不怕。」", { 'trust': 2, 'affection': 2 }],
                ["覺得氣氛太沉重，跑走", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'daily': "茶香與祭典的熱鬧形成對比，他溫柔地傾聽你說話。\n看著他斯文的微笑，你覺得一切都很平靜。",
            'daily_choices': [
                ["「學長很溫柔呢。」", { 'affection': 3, 'trust': 1 }],
                ["「學長為什麼一直盯著舊校舍？」", { 'curiosity': 1, 'fear': 1 }],
                ["覺得太無聊，跑去玩別的", { 'abandoned_partner': true }]
            ],
            'aftermath': "事件平息後，他輕柔地拂去你臉頰上沾到的灰塵。\n「我曾向自己發誓，絕對不讓你再經歷一次危險...看來我還是失職了。」",
            'aftermath_choices': [
                ["「再經歷一次？什麼意思？」", { 'curiosity': 2, 'courage': 1 }],
                ["握住他拂過臉頰的手", { 'affection': 3, 'trust': 2 }],
                ["「我沒事，學長別自責。」", { 'affection': 2, 'trust': 1 }]
            ],
            'memory': "你在一個廢棄櫃子裡找到一個舊醫藥箱。當年你因為傳聞跑來探險而受重傷，是他用這個醫藥箱幫你止血，並陪了你整晚。\n秦陌寂輕撫你的臉龐：「太好了...你終於想起來了。這段時間辛苦你了。」",
            'memory_alt': "煙火的光芒映照在他的眼鏡上。\n「只要你平安開心就好...忘記過去也沒關係。」"
        },
        'f1': {
            'intro': "走廊角落，深褐色捲髮的少女正在插花。看到你，她手中的花不慎掉落。\n她微微一愣，隨即露出溫柔禮貌的微笑：「你果然回來了呢，我一直相信著...」",
            'intro_choices': [
                ["「我們以前見過嗎？」", { 'trust': 2, 'curiosity': 1 }],
                ["「你這句話是什麼意思？」", { 'fear': 1, 'mystery_route': true }],
                ["「不好意思打擾了。」轉身離開", { 'affection': -1, 'ice_route': true }]
            ],
            'lunch': "午休時，你看到田媛寧獨自在頂樓角落，溫柔地餵食一隻流浪貓。\n她抬頭看到你，臉頰微紅：「要...要一起來摸摸牠嗎？」",
            'lunch_choices': [
                ["「好啊，牠好可愛。」", { 'affection': 2, 'trust': 1 }],
                ["「我對貓過敏，先走了。」", { 'ice_route': true }],
                ["靜靜地站在一旁看著她美麗的側臉", { 'affection': 2, 'curiosity': 1 }]
            ],
            'prep': "田媛寧遞給你一張手寫的校園祭行程表，字跡清秀。\n「我整理了地圖，請務必避開舊校舍那區，據說不太安全...」",
            'prep_choices': [
                ["「謝謝妳的用心，我會注意的。」", { 'affection': 2, 'trust': 1 }],
                ["「舊校舍到底有什麼？」", { 'curiosity': 2, 'fear': 1 }],
                ["「我不喜歡照表操課。」", { 'fear': 1, 'ice_route': true }]
            ],
            'rumor': "你無意間發現她正盯著一張舊校舍的老照片發呆，眼底閃過一抹悲傷。\n當你靠近時，她慌亂地將照片收進書本裡。",
            'rumor_choices': [
                ["「那是舊校舍的照片嗎？」", { 'curiosity': 2 }],
                ["假裝沒看到，關心她怎麼了", { 'trust': 2, 'affection': 1 }],
                ["一把搶過書本查看", { 'fear': 2, 'courage': 1 }]
            ],
            'festival': "她帶著你逛祭典，有條不紊地避開了擁擠的人潮。\n「我想先去圖書區，你想先從哪裡開始逛呢？」",
            'festival_choices': [
                ["「我想去舊校舍探險！」", { 'courage': 1, 'trust': 1 }, "investigate"],
                ["假裝同意，中途偷偷溜去舊校舍", { 'fear': 1, 'followed_target': true }, "follow"],
                ["「聽妳的，去圖書區吧。」", { 'affection': 2, 'normal_route': true }, "daily"]
            ],
            'investigate': "在舊校舍中，天花板突然掉下石塊！她深吸一口氣，將你拉到安全角落。\n「請躲在我身後。我會保護你...就像以前一樣。」",
            'investigate_choices': [
                ["握住她微微發抖的手", { 'affection': 3, 'trust': 2 }],
                ["「以前？妳認識小時候的我？」", { 'curiosity': 2 }],
                ["嚇壞了，獨自逃出舊校舍", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'follow': "你發現她偷偷在舊校舍後方獻花。\n她回頭看到你，眼眶微紅：「你不該來這裡的...會想起來那件悲傷的事。」",
            'follow_choices': [
                ["「請告訴我全部的真相！」", { 'curiosity': 2, 'courage': 1 }],
                ["「別哭，我會陪著妳。」", { 'trust': 2, 'affection': 2 }],
                ["覺得太靈異了，逃走", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'daily': "你們在頂樓安靜地吃著手工便當，她的手藝非常好。\n微風吹過，她溫柔內斂的氣質讓你感到無比放鬆。",
            'daily_choices': [
                ["「妳做的便當真好吃。」", { 'affection': 3, 'trust': 1 }],
                ["「妳為什麼要在行程裡刻意避開舊校舍？」", { 'curiosity': 1, 'fear': 1 }],
                ["覺得太安靜很無趣，提早離開", { 'abandoned_partner': true }]
            ],
            'aftermath': "脫離危機後，她靠在牆上微微喘息，一手按著胸口，語帶歉意：\n「對不起...是我沒有規劃好，才讓你陷入危險。」",
            'aftermath_choices': [
                ["「不是妳的錯，多虧妳保護了我。」", { 'affection': 3, 'trust': 2 }],
                ["「下次別再逞強了。」", { 'affection': 2 }],
                ["「是啊，差點沒命了。」", { 'fear': 1 }]
            ],
            'memory': "你在舊校舍後方發現了一個枯萎的秘密花園。當年你們一起在這裡種花，卻因為事故花園荒廢，你也失去了記憶。\n田媛寧溫柔地拭去眼淚：「沒關係的，只要你現在想起來就好了...我們重新開始吧。」",
            'memory_alt': "煙火在夜空綻放，她雙手交握祈禱。\n「只要你平安開心就好...這是我唯一的願望。」"
        },
        'f2': {
            'intro': "一名豔麗的黑髮少女正靠在走廊牆上打瞌睡。她睜開銳利的雙眼，打量著你。\n「呵，你果然回來了。算你遵守約定，沒讓我白等。」",
            'intro_choices': [
                ["「約定？我是不是忘記了什麼？」", { 'trust': 2, 'curiosity': 1 }],
                ["「妳是誰？幹嘛用那種眼神看我？」", { 'fear': 1, 'mystery_route': true }],
                ["不理會她，直接走開", { 'affection': -1, 'ice_route': true }]
            ],
            'lunch': "午餐時間，張栖鈴霸佔了交誼廳最舒適的沙發，高傲地對你勾勾手指。\n「喂，去幫我買杯特級珍珠奶茶，半糖少冰。快去。」",
            'lunch_choices': [
                ["乖乖去買最貴的那款給她", { 'affection': 3, 'trust': 1 }],
                ["故意買全糖去冰給她", { 'curiosity': 2, 'affection': 1 }],
                ["「自己去買！」", { 'fear': 1, 'courage': 1 }]
            ],
            'prep': "張栖鈴趴在桌上抱怨：「吵死了，那些舊校舍的傳聞煩不煩啊...」\n接著她精準地指出傳聞中不合理的地方，展現出驚人的敏銳度。",
            'prep_choices': [
                ["「妳好厲害，分析得真清楚！」", { 'affection': 2, 'trust': 1 }],
                ["「妳怎麼對舊校舍這麼了解？」", { 'curiosity': 2, 'fear': 1 }],
                ["「太吵了，我想安靜一下。」", { 'fear': 1, 'ice_route': true }]
            ],
            'rumor': "黑板上突然浮現一行詭異的紅字：「今晚...舊校舍...」。班上同學尖叫連連。\n她卻打了個哈欠，走上前直接把紅字擦掉：「無聊的惡作劇，別吵本小姐睡覺。」",
            'rumor_choices': [
                ["「妳膽子真大！」", { 'affection': 2, 'trust': 1 }],
                ["「那粉筆灰看起來有點怪...」", { 'curiosity': 2, 'courage': 1 }],
                ["「妳其實是在害怕吧？」", { 'affection': 1, 'fear': 1 }]
            ],
            'festival': "校園祭時她一臉嫌麻煩地走在你旁邊。\n「真麻煩...不過既然你開口了，我就勉為其難陪你逛逛吧。」",
            'festival_choices': [
                ["「既然來了，我們去最刺激的舊校舍吧！」", { 'courage': 1, 'trust': 1 }, "investigate"],
                ["看她不想走，自己偷偷溜去舊校舍", { 'fear': 1, 'followed_target': true }, "follow"],
                ["「那我們去買點吃的吧。」", { 'affection': 2, 'normal_route': true }, "daily"]
            ],
            'investigate': "舊校舍有老鼠竄過！她原本冷酷的臉瞬間破功，緊緊揪住你的衣角。\n「抓、抓緊我，別怕。我會保護你...就像以前一樣。」",
            'investigate_choices': [
                ["笑著反握住她的手", { 'affection': 3, 'trust': 2 }],
                ["「妳以前也這麼怕老鼠嗎？」", { 'curiosity': 2 }],
                ["被老鼠嚇到，丟下她跑走", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'follow': "你溜進舊校舍，發現她正拿著手電筒快速且熟練地檢查每個角落。\n她眉頭一皺：「你不該來這裡的...萬一想起來了怎麼辦？」",
            'follow_choices': [
                ["「到底有什麼不能讓我想起來的！」", { 'curiosity': 2, 'courage': 1 }],
                ["「我不想妳一個人冒險。」", { 'trust': 2, 'affection': 2 }],
                ["覺得氣氛不妙，趕緊溜走", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'daily': "她懶洋洋地坐在長椅上，使使喚你去買飲料跟食物。\n雖然態度高傲，但你看向她時，她會回以一個動人艷麗的輕笑。",
            'daily_choices': [
                ["乖乖買來她愛吃的東西", { 'affection': 3, 'trust': 1 }],
                ["「妳為什麼要在意舊校舍的事？」", { 'curiosity': 1, 'fear': 1 }],
                ["不想當跑腿，直接丟下她離開", { 'abandoned_partner': true }]
            ],
            'aftermath': "事件過後，她雖然語氣依然不耐煩，但抓著你衣袖的手卻異常緊繃。\n「真是個麻煩精...警告你，接下來不准離開我的視線半步！」",
            'aftermath_choices': [
                ["「遵命，女王大人。」", { 'affection': 3, 'trust': 2 }],
                ["「妳這是在擔心我嗎？」", { 'curiosity': 2, 'affection': 1 }],
                ["甩開她的手", { 'fear': 2, 'ice_route': true }]
            ],
            'memory': "你找到了一個機關複雜的機關盒，當年她懶得解開，是你興沖沖地解開卻引發了意外。\n張栖鈴冷哼了一聲，眼角卻帶著淚光：「算你還有點良心。以後可不准再忘記了，聽見沒？」",
            'memory_alt': "她看著煙火，無聊地打了個哈欠。\n「只要你平安開心就好...雖然照顧你真的很麻煩。」"
        },
        'f3': {
            'intro': "「喀嚓！」鎂光燈閃過，粉髮雙馬尾的少女拿著相機拍下你驚訝的臉。\n「哼！你果然回來了嘛！本小姐等你好久了！」",
            'intro_choices': [
                ["「妳拍我做什麼？我們認識？」", { 'trust': 2, 'curiosity': 1 }],
                ["「刪掉照片！妳是跟蹤狂嗎？」", { 'fear': 1, 'mystery_route': true }],
                ["無視她，轉身離開", { 'affection': -1, 'ice_route': true }]
            ],
            'lunch': "午餐時間，顧音棉硬是拿出一盒「地獄激辛炒麵」要求跟你比賽。\n結果她自己吃了一口就辣得眼眶泛淚，卻還硬撐著說不辣。",
            'lunch_choices': [
                ["趕緊遞水給她", { 'affection': 2, 'trust': 1 }],
                ["「哈哈，這點辣就不行啦？」", { 'curiosity': 1, 'affection': 1 }],
                ["冷眼旁觀", { 'fear': 1, 'ice_route': true }]
            ],
            'prep': "顧音棉完全無視上課鐘聲，把你拉到走廊上，秀出她的「幽靈探測儀」。\n「這可是本小姐的最新發明！我們晚上去舊校舍抓鬼吧！」",
            'prep_choices': [
                ["「好啊，感覺很好玩！」", { 'affection': 2, 'trust': 1 }],
                ["「為什麼妳這麼執著於抓鬼？」", { 'curiosity': 2, 'fear': 1 }],
                ["「我要回去上課了。」", { 'fear': 1, 'ice_route': true }]
            ],
            'rumor': "她在走廊佈置了一堆「抓鬼紅線與鈴鐺」，結果不小心絆倒了訓導主任。\n眼看就要被罵，她一把拉住你的手：「快跑！幽靈發動攻擊啦！」",
            'rumor_choices': [
                ["跟著她一起大笑狂奔", { 'affection': 3, 'courage': 1 }],
                ["「這樣會被記過的！」", { 'fear': 1, 'normal_route': true }],
                ["留在原地撇清關係", { 'fear': 2, 'ice_route': true }]
            ],
            'festival': "校園祭根本變成她的個人秀，她拉著你在人群中橫衝直撞。\n「快點快點！聽說那邊有超好玩的攤位，我們去看看！」",
            'festival_choices': [
                ["「我們直接去舊校舍抓鬼吧！」", { 'courage': 1, 'trust': 1 }, "investigate"],
                ["趁她玩得起勁，偷偷溜去舊校舍", { 'fear': 1, 'followed_target': true }, "follow"],
                ["「慢點慢點，我們一攤一攤逛。」", { 'affection': 2, 'normal_route': true }, "daily"]
            ],
            'investigate': "她大膽地踹開舊校舍的門，結果差點被掉下來的吊燈砸到！\n她一把拉開你，自信地挺起胸膛：「有本小姐在怕什麼！我會保護你...就像以前一樣。」",
            'investigate_choices': [
                ["「謝謝妳，妳真勇敢。」", { 'affection': 3, 'trust': 2 }],
                ["「以前妳也這麼衝動嗎？」", { 'curiosity': 2 }],
                ["受不了她的危險行為，轉身就跑", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'follow': "你偷偷去舊校舍，發現她正在裡面對著空氣說話，好像在尋找什麼。\n她轉頭看到你，鼓起腮幫子：「你不該來這裡的...萬一想起來了，你會怪我的。」",
            'follow_choices': [
                ["「妳到底在隱瞞什麼！」", { 'curiosity': 2, 'courage': 1 }],
                ["「不管發生什麼，我都不會怪妳。」", { 'trust': 2, 'affection': 2 }],
                ["覺得她在發神經，立刻逃走", { 'fear': 3, 'abandoned_partner': true }]
            ],
            'daily': "她在攤位大吃特吃，還強迫你戴上奇怪的貓耳髮箍。\n看她俏皮靈動的笑顏，你覺得被她耍得團團轉似乎也不壞。",
            'daily_choices': [
                ["笑著跟她一起瘋", { 'affection': 3, 'trust': 1 }],
                ["「妳為什麼突然對舊校舍失去興趣了？」", { 'curiosity': 1, 'fear': 1 }],
                ["覺得太丟臉，把貓耳扔給她走人", { 'abandoned_partner': true }]
            ],
            'aftermath': "危機解除後，她難得安靜下來，低頭擺弄著壞掉的探測儀。\n「這東西真沒用...如果連幽靈都抓不到，怎麼保護你啊...」",
            'aftermath_choices': [
                ["摸摸她的頭：「妳已經保護我了。」", { 'affection': 3, 'trust': 2 }],
                ["「妳到底在自責什麼？」", { 'curiosity': 2 }],
                ["「確實挺沒用的。」", { 'fear': 1 }]
            ],
            'memory': "你找到了一台摔壞的舊相機。當年她為了拍「幽靈」給你看看，硬拉著你來探險，導致你跌落樓梯失去記憶。\n顧音棉大哭著撲進你懷裡：「笨蛋！你怎麼現在才想起來啦！害我一直提心吊膽的！」",
            'memory_alt': "煙火升空，她得意地拿著相機拍下煙火。\n「只要你平安開心就好...本小姐的技術不錯吧！」"
        }
    };

    // 生成完整節點
    for (let char_id in storylines) {
        const data = storylines[char_id];
        nodes[`intro_${char_id}`] = {
            'text': data['intro'],
            'choices': data['intro_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `lunch_${char_id}` }))
        };
        nodes[`lunch_${char_id}`] = {
            'text': data['lunch'],
            'choices': data['lunch_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `prep_${char_id}` }))
        };
        nodes[`prep_${char_id}`] = {
            'text': data['prep'],
            'choices': data['prep_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `rumor_${char_id}` }))
        };
        nodes[`rumor_${char_id}`] = {
            'text': data['rumor'],
            'choices': data['rumor_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `festival_${char_id}` }))
        };
        nodes[`festival_${char_id}`] = {
            'text': data['festival'],
            'choices': data['festival_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `${c[2]}_${char_id}` }))
        };
        nodes[`investigate_${char_id}`] = {
            'text': data['investigate'],
            'choices': data['investigate_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `aftermath_${char_id}` }))
        };
        nodes[`follow_${char_id}`] = {
            'text': data['follow'],
            'choices': data['follow_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `aftermath_${char_id}` }))
        };
        nodes[`daily_${char_id}`] = {
            'text': data['daily'],
            'choices': data['daily_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': `aftermath_${char_id}` }))
        };
        nodes[`aftermath_${char_id}`] = {
            'text': data['aftermath'],
            'choices': data['aftermath_choices'].map(c => ({ 'text': c[0], 'statChange': c[1], 'next': "eval_chapter3" }))
        };

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

// Select Target Gender
function selectTargetGender(gender, event) {
    gameState.targetGender = gender;
    console.log("選擇攻略對象性別:", gender);
    
    const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = 'none';
    });
    
    const clickedBtn = event.currentTarget;
    clickedBtn.classList.add('selected');
    
    setTimeout(() => {
        if (gender === 'random') {
            showPlayerGenderSelection();
        } else {
            showCharacterSelection(gender);
        }
    }, 600);
}

// Show Target Character Selection Screen
function showCharacterSelection(gender) {
    gameState.currentStep = 'targetCharacter';
    document.getElementById('target-gender-selection').classList.remove('active');
    
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';
    
    const chars = charactersData[gender];
    chars.forEach(char => {
        grid.appendChild(createCharacterCard(char));
    });
    
    grid.appendChild(createCharacterCard({ id: 'random_char', name: '隨機', icon: '❓' }));
    
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
        showPlayerGenderSelection();
    }, 600);
}

// Show character info
function showCharacterInfo(charId, event) {
    event.stopPropagation();
    alert(`【展示人物介紹】\n這裡將在後續階段實作詳細的 ${charId} 介紹彈窗！`);
}

// Show Player Gender Selection Screen
function showPlayerGenderSelection() {
    gameState.currentStep = 'playerGender';
    
    document.getElementById('target-gender-selection').classList.remove('active');
    document.getElementById('target-character-selection').classList.remove('active');
    
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
        resolveRandomSelections();
        showConfirmationScreen();
    }, 600);
}

// Resolve Random Selections
function resolveRandomSelections() {
    if (gameState.targetGender === 'random') {
        const genders = ['male', 'female'];
        gameState.resolvedTargetGender = genders[Math.floor(Math.random() * genders.length)];
    } else {
        gameState.resolvedTargetGender = gameState.targetGender;
    }

    if (!gameState.targetCharacter || gameState.targetCharacter === 'random_char' || gameState.targetGender === 'random') {
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
        setTimeout(() => {
            document.getElementById('target-gender-selection').classList.add('active');
        }, 300);
        gameState.currentStep = 'targetGender';
        
        const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.pointerEvents = 'auto';
        });
    } else if (gameState.currentStep === 'playerGender') {
        document.getElementById('player-gender-selection').classList.remove('active');
        
        setTimeout(() => {
            if (gameState.targetGender === 'random') {
                document.getElementById('target-gender-selection').classList.add('active');
                gameState.currentStep = 'targetGender';
                
                const buttons = document.querySelectorAll('#target-gender-selection .choice-btn');
                buttons.forEach(btn => {
                    btn.classList.remove('selected');
                    btn.style.pointerEvents = 'auto';
                });
            } else {
                document.getElementById('target-character-selection').classList.add('active');
                gameState.currentStep = 'targetCharacter';
                
                const cards = document.querySelectorAll('#target-character-selection .character-card');
                cards.forEach(card => {
                    card.classList.remove('selected');
                    card.style.pointerEvents = 'auto';
                });
            }
        }, 300);
    } else if (gameState.currentStep === 'confirmation') {
        document.getElementById('confirmation-screen').classList.remove('active');
        
        setTimeout(() => {
            document.getElementById('player-gender-selection').classList.add('active');
        }, 300);
        gameState.currentStep = 'playerGender';
        
        const buttons = document.querySelectorAll('#player-gender-selection .choice-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.pointerEvents = 'auto';
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
        const dialogLine = document.createElement('p');
        let speakerName = "對方";
        if (gameState.targetKey && characters[gameState.targetKey]) {
            speakerName = characters[gameState.targetKey].name;
        }
        
        dialogLine.className = 'dialogue-line npc';
        const formattedText = formatDialogueText(node.text);
        dialogLine.innerHTML = `<span class="speaker">${speakerName}</span>${formattedText}`;
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
    
    // 將結局資訊作為特殊的對話方塊追加到對話紀錄面板中
    const historyContent = document.querySelector('.history-content');
    if (historyContent) {
        const titleLine = document.createElement('p');
        titleLine.className = 'dialogue-line system';
        titleLine.innerHTML = `<span class="speaker" style="color: #fcd34d; font-size: 1.4rem; display: block; margin-bottom: 0.5rem;">🎉 達成結局：${ending.title}</span>`;
        historyContent.appendChild(titleLine);

        const descLine = document.createElement('p');
        descLine.className = 'dialogue-line';
        descLine.style.borderLeftColor = '#fcd34d';
        descLine.innerText = ending.desc;
        historyContent.appendChild(descLine);
        
        scrollToBottom();
    }

    // 在選項區塊渲染一個「重新開始故事」的按鈕
    const choicesList = document.querySelector('.choices-list');
    if (choicesList) {
        choicesList.innerHTML = '';
        const restartBtn = document.createElement('button');
        restartBtn.className = 'choice-btn primary';
        restartBtn.innerText = '重新開始故事';
        restartBtn.style.width = '100%';
        restartBtn.onclick = () => {
            location.reload();
        };
        choicesList.appendChild(restartBtn);
    }
}
