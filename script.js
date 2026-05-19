let state = {
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
    abandoned_partner: false
};

let targetName = "神秘人";

// Story Data
const nodes = {
    start: {
        text: "歡迎來到《舊校舍的約定》。\n請選擇你想要體驗的戀愛故事類型：",
        choices: [
            { text: "男男戀 (BL)", target: "學長", next: "node_intro" },
            { text: "女女戀 (GL)", target: "學姊", next: "node_intro" },
            { text: "男女戀 (HL)", target: "HL", next: "node_hl_gender" }
        ]
    },
    node_hl_gender: {
        text: "請選擇你想扮演的性別：",
        choices: [
            { text: "扮演男生 (對象為女同學)", target: "女同學", next: "node_intro" },
            { text: "扮演女生 (對象為男同學)", target: "男同學", next: "node_intro" },
            { text: "交給命運決定 (隨機)", target: "random", next: "node_intro" }
        ]
    },
    node_intro: {
        text: "第一章：奇怪的初遇\n\n放學後的走廊上，你第一次遇見了{target}。\n對方直直地看著你，卻突然叫出你的名字：「你果然回來了。」\n但你非常確定，自己從來沒有見過對方。",
        choices: [
            { text: "「你是不是認錯人了？」", effect: () => { state.trust += 2; state.curiosity += 1; }, next: "node_festival_prep" },
            { text: "「……你調查我？」", effect: () => { state.fear += 1; state.mystery_route = true; }, next: "node_festival_prep" },
            { text: "轉身直接離開", effect: () => { state.affection -= 1; state.ice_route = true; }, next: "node_festival_prep" }
        ]
    },
    node_festival_prep: {
        text: "隔天，{target}居然轉到你的班上，而且就坐在你旁邊。\n下課時，{target}靜靜地看著窗外，似乎有著沉重的心事。",
        choices: [
            { text: "主動搭話：「那個...我們昨天見過吧？」", effect: () => { state.affection += 2; state.trust += 1; }, next: "node_festival" },
            { text: "試探性地問：「聽說舊校舍有奇怪的傳聞...」", effect: () => { state.curiosity += 2; state.fear += 1; }, next: "node_festival" },
            { text: "裝作不認識，自己趴著睡覺", effect: () => { state.fear += 1; state.ice_route = true; }, next: "node_festival" }
        ]
    },
    node_festival: {
        text: "第二章：校園祭的邀約\n\n學校開始流傳都市傳說：「夜晚的舊校舍，會吞沒某個人。」\n與此同時，你發現{target}最近的行為越來越異常，經常盯著舊校舍的方向看。",
        choices: [
            { text: "邀請{target}：「我們一起去舊校舍調查吧！」", effect: () => { state.courage += 1; state.trust += 1; }, next: "node_investigate" },
            { text: "決定放學後偷偷跟蹤{target}", effect: () => { state.fear += 1; state.followed_target = true; }, next: "node_follow" },
            { text: "裝作沒事，邀請{target}去逛校園祭攤位", effect: () => { state.affection += 2; state.normal_route = true; }, next: "node_daily_life" }
        ]
    },
    node_investigate: {
        text: "你們一起來到了陰暗的舊校舍。突然，一陣冷風吹過，門「砰」一聲關上了。\n{target}緊緊抓住你的手：「別怕，我會保護你...就像以前一樣。」",
        choices: [
            { text: "握緊對方的手：「我不怕，因為有你在。」", effect: () => { state.affection += 3; state.trust += 2; }, next: "eval_chapter3" },
            { text: "趁機詢問：「你說的『以前』到底是什麼意思？」", effect: () => { state.curiosity += 2; }, next: "eval_chapter3" },
            { text: "嚇得甩開手，獨自往反方向跑", effect: () => { state.fear += 3; state.abandoned_partner = true; }, next: "eval_chapter3" }
        ]
    },
    node_follow: {
        text: "你跟著{target}來到了舊校舍，卻不小心踩斷了樹枝。\n{target}猛然回頭，眼神複雜地看著你：「你不該來這裡的...會想起來的。」",
        choices: [
            { text: "勇敢對峙：「把你知道的全部告訴我！」", effect: () => { state.curiosity += 2; state.courage += 1; }, next: "eval_chapter3" },
            { text: "軟化態度：「我只是...很在意你。」", effect: () => { state.trust += 2; state.affection += 2; }, next: "eval_chapter3" },
            { text: "覺得太詭異了，轉身就跑", effect: () => { state.fear += 3; state.abandoned_partner = true; }, next: "eval_chapter3" }
        ]
    },
    node_daily_life: {
        text: "你們在校園祭逛著各種攤位，氣氛十分融洽。\n看著{target}開心的笑容，你覺得那些可怕的傳聞似乎都很遙遠。",
        choices: [
            { text: "買了對方一直在看的章魚燒並餵給對方吃", effect: () => { state.affection += 3; state.trust += 1; }, next: "eval_chapter3" },
            { text: "狀似無意地問：「你為什麼總是避開舊校舍？」", effect: () => { state.curiosity += 1; state.fear += 1; }, next: "eval_chapter3" },
            { text: "覺得無聊，丟下對方自己去玩鬼屋", effect: () => { state.abandoned_partner = true; }, next: "eval_chapter3" }
        ]
    },
    node_memory: {
        text: "第三章：封印的記憶\n\n隨著調查深入，你在一本舊校刊裡發現了驚人的真相。\n小時候，你曾在舊校舍發生過嚴重事故，而當時{target}就在現場，甚至為了救你受了傷。\n難怪你失去了那段記憶...",
        choices: [
            { text: "找到{target}並抱住對方：「我都想起來了，對不起讓你久等了。」", effect: () => { state.trust += 3; state.affection += 3; state.recovered_memory = true; }, next: "eval_ending" },
            { text: "崩潰地質問對方：「為什麼要瞞著我！你是不是有什麼企圖？」", effect: () => { state.fear += 3; state.affection -= 2; }, next: "eval_ending" },
            { text: "無法承受這個事實，選擇逃避並轉學", effect: () => { state.abandoned_partner = true; }, next: "eval_ending" }
        ]
    },
    node_memory_alt: {
        text: "第三章：未解之謎\n\n校園祭進入了尾聲，天空綻放著燦爛的煙火。\n{target}站在你身邊，眼神溫柔卻帶著一絲寂寞：「只要你平安開心就好...」",
        choices: [
            { text: "牽起對方的手：「以後也一起來看煙火吧。」", effect: () => { state.affection += 3; state.trust += 2; }, next: "eval_ending" },
            { text: "腦海中閃過一個畫面：「我們...是不是小時候一起看過煙火？」", effect: () => { state.trust += 3; state.recovered_memory = true; }, next: "eval_ending" },
            { text: "假裝沒聽見，逕自走回教室", effect: () => { state.abandoned_partner = true; }, next: "eval_ending" }
        ]
    }
};

const endings = {
    end_true: {
        title: "【TRUE END】你終於想起我了",
        desc: "主角完全恢復童年記憶。原來兩人曾約定：「以後一定要再見面。」在燦爛的煙火下，兩人正式確認了關係，解開了舊校舍的都市傳說。"
    },
    end_good: {
        title: "【GOOD END】至少這次沒有錯過",
        desc: "雖然記憶沒有完全恢復，但過去的羈絆讓你們再次互相吸引。兩人選擇從現在開始重新認識彼此，迎向新的未來。"
    },
    end_normal: {
        title: "【NORMAL END】普通的校園日常",
        desc: "事件平息後，舊校舍的傳聞也漸漸被遺忘。你們維持著普通的同學關係，過著平凡而寧靜的校園生活。"
    },
    end_bad: {
        title: "【BAD END】消失的人",
        desc: "強烈的恐懼與不信任讓你做出了錯誤的選擇。你獨自前往舊校舍尋找真相，卻被黑暗吞噬，成為了下一個都市傳說..."
    },
    end_comedy: {
        title: "【COMEDY END】大型社死現場",
        desc: "因為你各種無厘頭的逃跑與拋棄隊友行為，引發了校園祭的連環意外！最後你們兩人在全校師生面前出了大糗，成為了另一種意義上的傳說。"
    }
};

// UI Elements
const storyTextEl = document.getElementById('story-text');
const choicesEl = document.getElementById('choices');
const statsEl = document.getElementById('stats');
const endingBoxEl = document.getElementById('ending-box');
const endingTitleEl = document.getElementById('ending-title');
const endingDescEl = document.getElementById('ending-desc');
const restartBtn = document.getElementById('restart-btn');

function updateStats() {
    statsEl.innerHTML = `<span>好感: ${state.affection}</span> | <span>信任: ${state.trust}</span> | <span>恐懼: ${state.fear}</span> | <span>好奇: ${state.curiosity}</span>`;
}

function parseText(text) {
    return text.replace(/\{target\}/g, targetName);
}

function renderNode(nodeId) {
    // 邏輯匯流點處理
    if (nodeId === "eval_chapter3") {
        if (state.curiosity >= 2 || state.followed_target) {
            renderNode("node_memory");
        } else {
            renderNode("node_memory_alt");
        }
        return;
    }

    if (nodeId === "eval_ending") {
        renderEnding();
        return;
    }

    const node = nodes[nodeId];
    
    // 動畫重置
    storyTextEl.style.animation = 'none';
    storyTextEl.offsetHeight; 
    storyTextEl.style.animation = null;
    
    storyTextEl.innerText = parseText(node.text);
    choicesEl.innerHTML = '';
    
    node.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.innerText = choice.text;
        btn.onclick = () => {
            // 處理目標名稱替換
            if (choice.target) {
                if (choice.target === "random") {
                    targetName = Math.random() > 0.5 ? "女同學" : "男同學";
                } else if (choice.target !== "HL") {
                    targetName = choice.target;
                }
            }
            // 執行選項效果
            if (choice.effect) choice.effect();
            updateStats();
            // 進入下一個節點
            renderNode(choice.next);
        };
        choicesEl.appendChild(btn);
    });
}

function renderEnding() {
    choicesEl.classList.add('hidden');
    storyTextEl.classList.add('hidden');
    statsEl.classList.add('hidden');
    endingBoxEl.classList.remove('hidden');
    
    let endKey = 'end_normal';
    
    // 結局判定邏輯
    if (state.abandoned_partner) {
        endKey = 'end_comedy';
    } else if (state.fear >= 3 && state.trust <= 2) {
        endKey = 'end_bad';
    } else if (state.trust >= 5 && state.affection >= 5 && state.recovered_memory) {
        endKey = 'end_true';
    } else if (state.affection >= 4 && state.trust >= 3) {
        endKey = 'end_good';
    }

    const ending = endings[endKey];
    endingTitleEl.innerText = ending.title;
    endingDescEl.innerText = parseText(ending.desc);
}

function initGame() {
    // 初始化狀態
    state = {
        trust: 0, curiosity: 0, fear: 0, affection: 0, courage: 0,
        mystery_route: false, ice_route: false, normal_route: false,
        discovered_secret: false, followed_target: false,
        recovered_memory: false, abandoned_partner: false
    };
    targetName = "神秘人";
    
    choicesEl.classList.remove('hidden');
    storyTextEl.classList.remove('hidden');
    statsEl.classList.remove('hidden');
    endingBoxEl.classList.add('hidden');
    
    updateStats();
    renderNode('start');
}

restartBtn.addEventListener('click', initGame);

// 遊戲啟動
initGame();
