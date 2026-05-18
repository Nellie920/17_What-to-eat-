/**
 * 舊校舍的約定 - 劇情與資料模組
 * 
 * 由於您負責開發核心邏輯與顯示系統，這裡已將所有與 DOM (畫面) 相關的程式碼移除，
 * 僅保留純粹的資料結構 (Data Structures) 與狀態常數，方便您直接引入並套用到您的系統中。
 */

// 1. 遊戲初始狀態模板
const initialState = {
    trust: 0,
    curiosity: 0,
    fear: 0,
    affection: 0,
    courage: 0,
    mystery_route: false,
    ice_route: false,
    normal_route: false,
    discovered_secret: false,
    followed_target: false,
    recovered_memory: false,
    abandoned_partner: false,
    targetObj: null // 存放當前攻略角色的物件
};

// 2. 角色資料庫 (支援人格模板共用制)
const characters = {
    m1: { name: "洛頁彥", pronoun: "他", desc: "有著艷紅色的頭髮，笑起來有些孩子氣", react_surprise: "情緒全寫在臉上，驚訝地睜大眼睛", react_scared: "他雖然有些粗心大意，但在危機時立刻勇敢地擋在你前面", react_happy: "露出開朗大膽的笑容，艷紅色的頭髮在陽光下十分耀眼" },
    m2: { name: "齊勻楠", pronoun: "他", desc: "長相俊朗、黑色的頭髮，偶爾笑起來會有酒窩", react_surprise: "微微蹙眉，沉穩細心的眼神中閃過一絲訝異", react_scared: "將你護在身後，冷靜且做足準備地觀察四周退路", react_happy: "嘴角微微上揚，露出溫柔的酒窩，顯得十分機智沉穩" },
    m3: { name: "秦陌寂", pronoun: "他", desc: "長相溫和斯文、棕褐色的頭髮，戴著銀框眼鏡", react_surprise: "推了推銀框眼鏡，神色溫和但帶著不解", react_scared: "輕拍你的肩膀安撫你，體貼且穩當地解決眼前的混亂", react_happy: "露出斯文的微笑，眼神中充滿令人安心的樂觀" },
    f1: { name: "田媛寧", pronoun: "她", desc: "面容溫柔、深褐色捲髮", react_surprise: "微微一愣，即使無語時仍保持著禮貌的微笑", react_scared: "她深吸一口氣讓自己不忙亂，有條理地尋找解決方案", react_happy: "溫柔地笑著，謙遜內斂的氣質讓人十分放鬆" },
    f2: { name: "張栖鈴", pronoun: "她", desc: "面容艷麗、黑色長髮", react_surprise: "習慣性地蹙起眉頭，敏銳地打量著你", react_scared: "她皺著眉看似不耐煩，卻悄悄抓緊你的衣角高效率地防備", react_happy: "輕笑了一聲，機靈的眼神與艷麗的面容更顯動人" },
    f3: { name: "顧音棉", pronoun: "她", desc: "俏皮靈動、粉髮雙麻花辮", react_surprise: "不滿地鼓起腮幫子，睜大眼睛好奇地盯著你", react_scared: "她看似我行我素，卻在此時緊緊跟在你身邊觀察變故", react_happy: "俏皮地眨了眨眼，充滿自信與張揚的笑容十分迷人" }
};

// 3. 結局資料庫
const endings = {
    end_true: {
        title: "【TRUE END】你終於想起我了",
        desc: "主角完全恢復童年記憶。原來兩人曾約定：「以後一定要再見面。」在燦爛的煙火下，你與{name}正式確認了關係，解開了舊校舍的都市傳說。"
    },
    end_good: {
        title: "【GOOD END】至少這次沒有錯過",
        desc: "雖然記憶沒有完全恢復，但過去的羈絆讓你與{name}再次互相吸引。兩人選擇從現在開始重新認識彼此，迎向新的未來。"
    },
    end_normal: {
        title: "【NORMAL END】普通的校園日常",
        desc: "事件平息後，舊校舍的傳聞也漸漸被遺忘。你與{name}維持著普通的同學關係，過著平凡而寧靜的校園生活。"
    },
    end_bad: {
        title: "【BAD END】消失的人",
        desc: "強烈的恐懼與不信任讓你做出了錯誤的選擇。你獨自前往舊校舍尋找真相，卻被黑暗吞噬，成為了下一個都市傳說..."
    },
    end_comedy: {
        title: "【COMEDY END】大型社死現場",
        desc: "因為你各種無厘頭的逃跑與拋棄隊友行為，引發了校園祭的連環意外！最後你跟{name}兩人在全校師生面前出了大糗，成為了另一種意義上的傳說。"
    }
};

// 4. 劇情節點資料庫
// 每個節點包含 text 與 choices，您可以將 effect 中的狀態變更函式，對接到您自己開發的引擎狀態系統中。
const storyNodes = {
    start: {
        text: "歡迎來到《舊校舍的約定》。\n請選擇你想要體驗的戀愛故事類型：",
        choices: [
            { text: "男男戀 (BL)", next: "select_target_m" },
            { text: "女女戀 (GL)", next: "select_target_f" },
            { text: "男女戀 (HL)", next: "node_hl_gender" }
        ]
    },
    node_hl_gender: {
        text: "請選擇你想扮演的性別：",
        choices: [
            { text: "扮演男生 (對象為女性)", next: "select_target_f" },
            { text: "扮演女生 (對象為男性)", next: "select_target_m" },
            { text: "交給命運決定 (隨機)", next: "random_gender" } // 交由您的邏輯系統處理隨機跳轉
        ]
    },
    select_target_m: {
        text: "請選擇你想攻略的對象：",
        choices: [
            { text: "洛頁彥 (開朗大膽，艷紅髮色)", targetKey: "m1", next: "node_intro" },
            { text: "齊勻楠 (沉穩細心，長相俊朗)", targetKey: "m2", next: "node_intro" },
            { text: "秦陌寂 (溫和斯文，銀框眼鏡)", targetKey: "m3", next: "node_intro" }
        ]
    },
    select_target_f: {
        text: "請選擇你想攻略的對象：",
        choices: [
            { text: "田媛寧 (溫柔內斂，深褐捲髮)", targetKey: "f1", next: "node_intro" },
            { text: "張栖鈴 (機靈艷麗，黑色長髮)", targetKey: "f2", next: "node_intro" },
            { text: "顧音棉 (張揚自信，粉髮雙馬尾)", targetKey: "f3", next: "node_intro" }
        ]
    },
    node_intro: {
        text: "第一章：奇怪的初遇\n\n放學後的走廊上，你第一次遇見了{name}。\n{desc}的{pronoun}直直地看著你，卻突然叫出你的名字：「你果然回來了。」\n但你非常確定，自己從來沒有見過對方。",
        choices: [
            { text: "「你是不是認錯人了？」", statChange: { trust: 2, curiosity: 1 }, next: "node_festival_prep" },
            { text: "「……你調查我？」", statChange: { fear: 1, mystery_route: true }, next: "node_festival_prep" },
            { text: "轉身直接離開", statChange: { affection: -1, ice_route: true }, next: "node_festival_prep" }
        ]
    },
    node_festival_prep: {
        text: "隔天，{name}居然轉到你的班上，而且就坐在你旁邊。\n下課時，{name}{react_surprise}，似乎有著沉重的心事。",
        choices: [
            { text: "主動搭話：「那個...我們昨天見過吧？」", statChange: { affection: 2, trust: 1 }, next: "node_festival" },
            { text: "試探性地問：「聽說舊校舍有奇怪的傳聞...」", statChange: { curiosity: 2, fear: 1 }, next: "node_festival" },
            { text: "裝作不認識，自己趴著睡覺", statChange: { fear: 1, ice_route: true }, next: "node_festival" }
        ]
    },
    node_festival: {
        text: "第二章：校園祭的邀約\n\n學校開始流傳都市傳說：「夜晚的舊校舍，會吞沒某個人。」\n與此同時，你發現{name}最近的行為越來越異常，經常盯著舊校舍的方向看。",
        choices: [
            { text: "邀請{name}：「我們一起去舊校舍調查吧！」", statChange: { courage: 1, trust: 1 }, next: "node_investigate" },
            { text: "決定放學後偷偷跟蹤{name}", statChange: { fear: 1, followed_target: true }, next: "node_follow" },
            { text: "裝作沒事，邀請{name}去逛校園祭攤位", statChange: { affection: 2, normal_route: true }, next: "node_daily_life" }
        ]
    },
    node_investigate: {
        text: "你們一起來到了陰暗的舊校舍。突然，一陣冷風吹過，門「砰」一聲關上了。\n{name}{react_scared}，並對你說：「別怕，我會保護你...就像以前一樣。」",
        choices: [
            { text: "握緊{pronoun}的手：「我不怕，因為有你在。」", statChange: { affection: 3, trust: 2 }, next: "eval_chapter3" },
            { text: "趁機詢問：「你說的『以前』到底是什麼意思？」", statChange: { curiosity: 2 }, next: "eval_chapter3" },
            { text: "嚇得甩開手，獨自往反方向跑", statChange: { fear: 3, abandoned_partner: true }, next: "eval_chapter3" }
        ]
    },
    node_follow: {
        text: "你跟著{name}來到了舊校舍，卻不小心踩斷了樹枝。\n{name}猛然回頭，{react_surprise}，對你說：「你不該來這裡的...會想起來的。」",
        choices: [
            { text: "勇敢對峙：「把你知道的全部告訴我！」", statChange: { curiosity: 2, courage: 1 }, next: "eval_chapter3" },
            { text: "軟化態度：「我只是...很在意你。」", statChange: { trust: 2, affection: 2 }, next: "eval_chapter3" },
            { text: "覺得太詭異了，轉身就跑", statChange: { fear: 3, abandoned_partner: true }, next: "eval_chapter3" }
        ]
    },
    node_daily_life: {
        text: "你們在校園祭逛著各種攤位，氣氛十分融洽。\n看著{name}{react_happy}，你覺得那些可怕的傳聞似乎都很遙遠。",
        choices: [
            { text: "買了{pronoun}一直在看的章魚燒並餵給{pronoun}吃", statChange: { affection: 3, trust: 1 }, next: "eval_chapter3" },
            { text: "狀似無意地問：「你為什麼總是避開舊校舍？」", statChange: { curiosity: 1, fear: 1 }, next: "eval_chapter3" },
            { text: "覺得無聊，丟下{pronoun}自己去玩鬼屋", statChange: { abandoned_partner: true }, next: "eval_chapter3" }
        ]
    },
    node_memory: {
        text: "第三章：封印的記憶\n\n隨著調查深入，你在一本舊校刊裡發現了驚人的真相。\n小時候，你曾在舊校舍發生過嚴重事故，而當時{name}就在現場，甚至為了救你受了傷。\n難怪你失去了那段記憶...",
        choices: [
            { text: "找到{name}並抱住{pronoun}：「我都想起來了，對不起讓你久等了。」", statChange: { trust: 3, affection: 3, recovered_memory: true }, next: "eval_ending" },
            { text: "崩潰地質問{name}：「為什麼要瞞著我！你是不是有什麼企圖？」", statChange: { fear: 3, affection: -2 }, next: "eval_ending" },
            { text: "無法承受這個事實，選擇逃避並轉學", statChange: { abandoned_partner: true }, next: "eval_ending" }
        ]
    },
    node_memory_alt: {
        text: "第三章：未解之謎\n\n校園祭進入了尾聲，天空綻放著燦爛的煙火。\n{name}站在你身邊，{react_happy}，眼神卻帶著一絲寂寞：「只要你平安開心就好...」",
        choices: [
            { text: "牽起{pronoun}的手：「以後也一起來看煙火吧。」", statChange: { affection: 3, trust: 2 }, next: "eval_ending" },
            { text: "腦海中閃過一個畫面：「我們...是不是小時候一起看過煙火？」", statChange: { trust: 3, recovered_memory: true }, next: "eval_ending" },
            { text: "假裝沒聽見，逕自走回教室", statChange: { abandoned_partner: true }, next: "eval_ending" }
        ]
    }
};

// 5. 匯出模組供您的顯示系統與引擎掛載使用
export { initialState, characters, endings, storyNodes };
