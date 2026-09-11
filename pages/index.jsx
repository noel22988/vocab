import { useState, useEffect, useCallback, useMemo } from 'react';
import DATA from '../data/wordData.json';

// Everything about a word lives in one record in wordData.json. The structures
// below are rebuilt from it at load, so the rest of the app is unchanged.
const COLLOC_EN = {};
const WORD_DATA = {};
for (const [w, d] of Object.entries(DATA.words)) {
  const cols = [];
  for (const c of (d.collocations || [])) { cols.push(c.cn); if (c.en) COLLOC_EN[c.cn] = c.en; }
  WORD_DATA[w] = { ...d, collocations: cols };
}
const _ENTRIES = Object.entries(WORD_DATA);
const EXAM_WORDS = _ENTRIES.filter(([, d]) => d.years).sort((a, b) => a[1].xi - b[1].xi)
  .map(([w, d]) => ({ w, t: d.type, y: d.years }));
const SYLLABUS_RAW = _ENTRIES.filter(([, d]) => d.s != null).sort((a, b) => a[1].si - b[1].si)
  .map(([w, d]) => ({ w, py: d.spy !== undefined ? d.spy : d.py, s: d.s }));
const _charGroups = (order, keyOf, idx) => order.map(ch => ({
  char: ch,
  words: _ENTRIES.filter(([w, d]) => d[idx] != null && keyOf(w) === ch)
    .sort((a, b) => a[1][idx] - b[1][idx]).map(([w]) => w),
}));
const CHAR_F = _charGroups(DATA.charFOrder, w => w[0], 'cfi');
const CHAR_L = _charGroups(DATA.charLOrder, w => { const a = [...w]; return a[a.length - 1]; }, 'cli');

// ─── DATA ─────────────────────────────────────────────────────────────────────
const IDIOMS = [
  {word:"黯然神伤",pinyin:"àn rán shén shāng",meaning:"Heartbroken and depressed",cn:"想起去世的奶奶，又翻到她生前的照片，他独自坐在角落里，黯然神伤。",en:"Thinking of his late grandmother and seeing her old photos, he sat alone in the corner, heartbroken."},
  {word:"安于现状",pinyin:"ān yú xiàn zhuàng",meaning:"Content with the current situation",cn:"别人都在努力进修、争取升职，他却安于现状，不愿做出任何改变。",en:"While others studied hard and sought promotion, he was content with the status quo and unwilling to change."},
  {word:"百折不挠",pinyin:"bǎi zhé bù náo",meaning:"Indomitable; never gives up",cn:"创业路上失败了一次又一次，他依然百折不挠，最终取得了成功。",en:"Failing again and again on his entrepreneurial journey, he remained indomitable and finally succeeded."},
  {word:"暴跳如雷",pinyin:"bào tiào rú léi",meaning:"Fly into a rage",cn:"听说儿子又逃学打架，父亲气得暴跳如雷，把桌子拍得震天响。",en:"Hearing his son had skipped school and fought again, the father flew into a rage and slammed the table."},
  {word:"不辞辛劳",pinyin:"bù cí xīn láo",meaning:"Toil tirelessly",cn:"为了赶在截止前完成工程，工人们日夜不停、不辞辛劳地干活。",en:"To finish the project before the deadline, the workers toiled tirelessly day and night."},
  {word:"不甘示弱",pinyin:"bù gān shì ruò",meaning:"Unwilling to show weakness",cn:"对手连连得分，我方队员也不甘示弱，奋起直追，扳回了比分。",en:"As opponents scored repeatedly, our players, unwilling to show weakness, fought back and evened the score."},
  {word:"不假思索",pinyin:"bù jiǎ sī suǒ",meaning:"Without thinking; spontaneously",cn:"老师的问题刚问完，他就不假思索地举手，脱口说出了答案。",en:"The moment the teacher finished asking, he raised his hand without thinking and blurted out the answer."},
  {word:"不解之缘",pinyin:"bù jiě zhī yuán",meaning:"Indissoluble bond",cn:"从小在海边长大的他，与大海结下了不解之缘，长大后成了海洋学家。",en:"Growing up by the sea, he formed an indissoluble bond with the ocean and became a marine scientist."},
  {word:"不可或缺",pinyin:"bù kě huò quē",meaning:"Indispensable",cn:"水和空气是维持生命不可或缺的东西，一刻也离不开。",en:"Water and air are indispensable to life; we cannot do without them for a moment."},
  {word:"不可思议",pinyin:"bù kě sī yì",meaning:"Inconceivable; unbelievable",cn:"这么小的蚂蚁竟能举起比自己重几十倍的东西，真是不可思议。",en:"It is inconceivable that such a tiny ant can lift something dozens of times its own weight."},
  {word:"不屈不挠",pinyin:"bù qū bù náo",meaning:"Indomitable spirit",cn:"面对敌人的威逼利诱，他始终不屈不挠，没有透露半点机密。",en:"Facing the enemy's threats and bribes, he remained unyielding and revealed not a single secret."},
  {word:"不胜枚举",pinyin:"bù shèng méi jǔ",meaning:"Too numerous to mention",cn:"他乐于助人的事迹太多了，简直不胜枚举，大家都很敬佩他。",en:"His good deeds are too numerous to mention, and everyone admires him."},
  {word:"不闻不问",pinyin:"bù wén bù wèn",meaning:"Indifferent; unconcerned",cn:"邻居家失了火，他竟然不闻不问，关上门继续看自己的电视。",en:"When the neighbor's house caught fire, he remained indifferent and went on watching TV behind closed doors."},
  {word:"不以为然",pinyin:"bù yǐ wéi rán",meaning:"Not think much of something",cn:"大家都劝他注意身体，他却不以为然，依旧熬夜通宵。",en:"Everyone urged him to take care of his health, but he thought little of it and kept staying up all night."},
  {word:"不约而同",pinyin:"bù yuē ér tóng",meaning:"Coincidentally; without prior agreement",cn:"听到这个好消息，在场的人不约而同地鼓起掌来。",en:"Hearing the good news, everyone present broke into applause as if by agreement."},
  {word:"不自量力",pinyin:"bù zì liàng lì",meaning:"Overestimate one's abilities",cn:"他连基本功都没练好，就想挑战世界冠军，未免太不自量力了。",en:"He hasn't mastered the basics yet wants to challenge the world champion — he overestimates himself."},
  {word:"称心如意",pinyin:"chèn xīn rú yì",meaning:"Everything is satisfactory",cn:"这套房子地段好、价格也合适，买到后他觉得十分称心如意。",en:"The house is well-located and reasonably priced; after buying it he felt completely satisfied."},
  {word:"赤手空拳",pinyin:"chì shǒu kōng quán",meaning:"Bare-handed; with nothing",cn:"他刚到城市时赤手空拳，什么都没有，全靠双手打拼出一片天地。",en:"He arrived in the city empty-handed with nothing, building everything with his own two hands."},
  {word:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"Persevere consistently",cn:"学习贵在持之以恒，三天打鱼两天晒网是学不好的。",en:"Learning requires perseverance; you can't succeed by working in fits and starts."},
  {word:"处心积虑",pinyin:"chǔ xīn jī lǜ",meaning:"Meticulously scheming",cn:"为了夺取那个职位，他处心积虑，暗中算计了好几年。",en:"To seize that position, he schemed meticulously, plotting in secret for years."},
  {word:"处之泰然",pinyin:"chǔ zhī tài rán",meaning:"Take things calmly",cn:"面对突如其来的变故，他依旧处之泰然，没有丝毫慌乱。",en:"Facing the sudden upheaval, he stayed perfectly calm, without the slightest panic."},
  {word:"大同小异",pinyin:"dà tóng xiǎo yì",meaning:"Similar in essential aspects",cn:"这几个方案看起来不同，其实大同小异，核心内容都一样。",en:"These plans look different but are largely alike; their core content is the same."},
  {word:"得意忘形",pinyin:"dé yì wàng xíng",meaning:"Let success go to one's head",cn:"刚取得一点成绩，他就得意忘形，到处炫耀，结果摔了大跟头。",en:"After a small success he let it go to his head, showing off everywhere, and came to grief."},
  {word:"多种多样",pinyin:"duō zhǒng duō yàng",meaning:"Diverse; varied",cn:"这家书店的图书多种多样，文学、科学、艺术应有尽有。",en:"This bookstore's books are diverse — literature, science, and art are all available."},
  {word:"敷衍塞责",pinyin:"fū yǎn sè zé",meaning:"Do things superficially",cn:"这件事他只是敷衍塞责，随便应付了几句就走了。",en:"He merely went through the motions, mumbled a few words, and left."},
  {word:"格格不入",pinyin:"gé gé bù rù",meaning:"Incompatible; doesn't fit in",cn:"他的穿着和这个庄重的场合格格不入，显得十分突兀。",en:"His clothes were incompatible with the solemn occasion and looked quite out of place."},
  {word:"古道热肠",pinyin:"gǔ dào rè cháng",meaning:"Warm-hearted and generous",cn:"这位老人古道热肠，谁有困难他都会主动伸出援手。",en:"This warm-hearted old man lends a hand to anyone in trouble."},
  {word:"哄堂大笑",pinyin:"hōng táng dà xiào",meaning:"Roar with laughter",cn:"他讲的笑话太逗了，逗得全班同学哄堂大笑。",en:"His joke was so funny that the whole class roared with laughter."},
  {word:"急功近利",pinyin:"jí gōng jìn lì",meaning:"Eager for quick success",cn:"做学问不能急功近利，必须脚踏实地，慢慢积累。",en:"Scholarship can't be rushed for quick gain; it takes steady, gradual effort."},
  {word:"坚韧不拔",pinyin:"jiān rèn bù bá",meaning:"Persistent and determined",cn:"凭着坚韧不拔的毅力，他终于攀上了那座险峻的高峰。",en:"With persistent, unbending determination, he finally scaled the steep peak."},
  {word:"截然不同",pinyin:"jié rán bù tóng",meaning:"Completely different",cn:"兄弟俩长得很像，性格却截然不同，一个外向一个内向。",en:"The brothers look alike but are completely different in character — one outgoing, one shy."},
  {word:"津津乐道",pinyin:"jīn jīn lè dào",meaning:"Take delight in talking about",cn:"那场精彩的比赛，至今仍被球迷们津津乐道。",en:"That thrilling match is still talked about with delight by fans today."},
  {word:"尽如人意",pinyin:"jìn rú rén yì",meaning:"As desired; satisfactory",cn:"事情的结果并不尽如人意，但他已经尽力了。",en:"The outcome wasn't entirely as hoped, but he had done his best."},
  {word:"进退维谷",pinyin:"jìn tuì wéi gǔ",meaning:"In a dilemma",cn:"前面是悬崖，后面有追兵，他陷入了进退维谷的境地。",en:"A cliff ahead and pursuers behind — he was caught in a dilemma."},
  {word:"惊慌失措",pinyin:"jīng huāng shī cuò",meaning:"Panic-stricken",cn:"突然停电，剧院里一片漆黑，观众们惊慌失措，四处乱窜。",en:"When the power suddenly cut out, the dark theater filled with panic-stricken people scrambling about."},
  {word:"刻苦耐劳",pinyin:"kè kǔ nài láo",meaning:"Hardworking and enduring",cn:"他从小刻苦耐劳，再苦再累的活儿也从不抱怨。",en:"Hardworking and enduring since childhood, he never complained about even the hardest work."},
  {word:"哭笑不得",pinyin:"kū xiào bù dé",meaning:"Between laughter and tears; dumbfounded",cn:"孩子把面粉当成雪洒了一地，弄得妈妈哭笑不得。",en:"The child scattered flour everywhere as if it were snow, leaving mom not knowing whether to laugh or cry."},
  {word:"理所当然",pinyin:"lǐ suǒ dāng rán",meaning:"Take for granted; as a matter of course",cn:"父母的付出并不是理所当然的，我们应该懂得感恩。",en:"Our parents' sacrifices should not be taken for granted; we should be grateful."},
  {word:"屡见不鲜",pinyin:"lǚ jiàn bù xiān",meaning:"Common occurrence; nothing new",cn:"如今手机支付已经屡见不鲜，几乎人人都在使用。",en:"Mobile payment is now commonplace; almost everyone uses it."},
  {word:"面红耳赤",pinyin:"miàn hóng ěr chì",meaning:"Blush with embarrassment",cn:"被老师当众点名批评，他羞愧得面红耳赤，低下了头。",en:"Scolded by the teacher in public, he blushed with shame and lowered his head."},
  {word:"漠不关心",pinyin:"mò bù guān xīn",meaning:"Indifferent; apathetic",cn:"对于班级的集体活动，他总是漠不关心，从不参与。",en:"He is always indifferent to class activities and never takes part."},
  {word:"莫名其妙",pinyin:"mò míng qí miào",meaning:"Baffling; inexplicable",cn:"他无缘无故地发了一通脾气，让大家都觉得莫名其妙。",en:"He flew into a temper for no reason, leaving everyone baffled."},
  {word:"目不暇接",pinyin:"mù bù xiá jiē",meaning:"Too many things for the eye to take in",cn:"展览会上的新奇展品琳琅满目，看得人目不暇接。",en:"The novel exhibits dazzled the eyes — there was too much to take in."},
  {word:"目瞪口呆",pinyin:"mù dèng kǒu dāi",meaning:"Stunned; dumbfounded",cn:"看到魔术师把鸽子变没了，孩子们都看得目瞪口呆。",en:"Seeing the magician make the dove vanish, the children were left dumbfounded."},
  {word:"品头论足",pinyin:"pǐn tóu lùn zú",meaning:"Nitpick; find fault with others",cn:"他总爱对别人的穿着品头论足，惹得大家很不高兴。",en:"He's always nitpicking others' clothes, which annoys everyone."},
  {word:"平淡无奇",pinyin:"píng dàn wú qí",meaning:"Ordinary and unremarkable",cn:"这部电影情节平淡无奇，没有一点吸引人的地方。",en:"The film's plot was ordinary and unremarkable, with nothing appealing about it."},
  {word:"迫不及待",pinyin:"pò bù jí dài",meaning:"Impatient; can't wait",cn:"一放暑假，他就迫不及待地收拾行李，准备去旅行。",en:"The moment summer break began, he couldn't wait to pack and set off traveling."},
  {word:"破涕为笑",pinyin:"pò tì wéi xiào",meaning:"Turn tears into laughter",cn:"听到妈妈答应带他去公园，小弟弟立刻破涕为笑。",en:"Hearing mom agree to take him to the park, the little boy's tears instantly turned to laughter."},
  {word:"气喘吁吁",pinyin:"qì chuǎn xū xū",meaning:"Gasping for breath",cn:"他一口气爬上了六楼，累得气喘吁吁，满头大汗。",en:"He climbed to the sixth floor in one go, gasping for breath and dripping with sweat."},
  {word:"千变万化",pinyin:"qiān biàn wàn huà",meaning:"Ever-changing",cn:"天上的云朵千变万化，一会儿像马，一会儿像羊。",en:"The clouds were ever-changing, now like a horse, now like a sheep."},
  {word:"前仆后继",pinyin:"qián pū hòu jì",meaning:"Successive waves pressing forward",cn:"革命先烈前仆后继，用鲜血换来了今天的幸福生活。",en:"Wave after wave of revolutionary martyrs pressed forward, winning today's happy life with their blood."},
  {word:"千姿百态",pinyin:"qiān zī bǎi tài",meaning:"A variety of postures and forms",cn:"公园里的菊花千姿百态，有的含苞待放，有的迎风怒放。",en:"The chrysanthemums in the park took countless forms — some in bud, some in full bloom."},
  {word:"锲而不舍",pinyin:"qiè ér bù shě",meaning:"Persevere without giving up",cn:"只要锲而不舍地钻研下去，再难的问题也能解决。",en:"As long as you persevere in your research, even the hardest problems can be solved."},
  {word:"情不自禁",pinyin:"qíng bù zì jīn",meaning:"Unable to restrain emotions",cn:"看到这感人的一幕，她情不自禁地流下了热泪。",en:"Seeing this moving scene, she couldn't help shedding tears."},
  {word:"情有独钟",pinyin:"qíng yǒu dú zhōng",meaning:"Have a special fondness for",cn:"别的玩具他都不爱，唯独对那架小飞机情有独钟。",en:"He cared for no other toy, having a special fondness only for that little airplane."},
  {word:"日新月异",pinyin:"rì xīn yuè yì",meaning:"Change with each passing day",cn:"几年没回家乡，那里的变化日新月异，处处是新建的高楼。",en:"After a few years away, his hometown had changed by the day, with new high-rises everywhere."},
  {word:"若无其事",pinyin:"ruò wú qí shì",meaning:"Act as if nothing happened",cn:"闯了这么大的祸，他却若无其事，照样有说有笑。",en:"Having caused such trouble, he acted as if nothing had happened, chatting and laughing as usual."},
  {word:"煞费苦心",pinyin:"shà fèi kǔ xīn",meaning:"Take great pains",cn:"为了让女儿开心，他煞费苦心，精心准备了一场惊喜派对。",en:"To make his daughter happy, he took great pains to prepare a surprise party."},
  {word:"设身处地",pinyin:"shè shēn chǔ dì",meaning:"Put oneself in someone's shoes",cn:"我们应该设身处地为别人着想，多体谅他人的难处。",en:"We should put ourselves in others' shoes and be considerate of their difficulties."},
  {word:"深思熟虑",pinyin:"shēn sī shú lǜ",meaning:"Think deeply and carefully",cn:"这是个重大决定，经过深思熟虑后，他才慎重地做出选择。",en:"It was a major decision; only after deep and careful thought did he make his choice."},
  {word:"视若无睹",pinyin:"shì ruò wú dǔ",meaning:"Turn a blind eye",cn:"地上明明有垃圾，他却视若无睹，从旁边径直走了过去。",en:"There was clearly litter on the ground, but he turned a blind eye and walked straight past."},
  {word:"世外桃源",pinyin:"shì wài táo yuán",meaning:"Utopia; paradise",cn:"这个山村远离喧嚣，风景秀丽，简直是个世外桃源。",en:"Far from the noise and beautifully scenic, this mountain village is a veritable paradise."},
  {word:"始终如一",pinyin:"shǐ zhōng rú yī",meaning:"Consistent from start to finish",cn:"几十年来，他对工作的热情始终如一，从未减退。",en:"For decades his passion for work has remained consistent, never fading."},
  {word:"手足无措",pinyin:"shǒu zú wú cuò",meaning:"At a loss; flustered",cn:"面对突然的提问，他一时手足无措，连话都说不清楚。",en:"Faced with the sudden question, he was momentarily at a loss, unable even to speak clearly."},
  {word:"手足之情",pinyin:"shǒu zú zhī qíng",meaning:"Brotherly love; deep friendship",cn:"兄弟俩从小相依为命，手足之情格外深厚。",en:"The two brothers depended on each other since childhood; their brotherly bond is especially deep."},
  {word:"似曾相识",pinyin:"sì céng xiāng shí",meaning:"Seem familiar; déjà vu",cn:"第一次来到这个地方，他却有一种似曾相识的感觉。",en:"Though it was his first visit, he had a strange sense of déjà vu."},
  {word:"似笑非笑",pinyin:"sì xiào fēi xiào",meaning:"A smile that isn't quite a smile",cn:"他脸上挂着似笑非笑的表情，让人猜不透他在想什么。",en:"He wore a smile that wasn't quite a smile, leaving others unable to read his thoughts."},
  {word:"随机应变",pinyin:"suí jī yìng biàn",meaning:"Adapt to changing circumstances",cn:"情况随时会变，我们要学会随机应变，灵活处理。",en:"Circumstances can change at any time, so we must learn to adapt and respond flexibly."},
  {word:"忐忑不安",pinyin:"tǎn tè bù ān",meaning:"Uneasy and anxious",cn:"等待考试成绩的那几天，他的心里一直忐忑不安。",en:"During the days waiting for his exam results, he felt uneasy and anxious."},
  {word:"天伦之乐",pinyin:"tiān lún zhī lè",meaning:"The joy of family togetherness",cn:"一家人围坐在一起吃团圆饭，尽享天伦之乐。",en:"The family sat together over a reunion dinner, fully enjoying the warmth of being together."},
  {word:"挺身而出",pinyin:"tǐng shēn ér chū",meaning:"Step forward bravely",cn:"看到有人落水，他毫不犹豫地挺身而出，跳进河里救人。",en:"Seeing someone fall into the water, he stepped forward without hesitation and dived in to save them."},
  {word:"突如其来",pinyin:"tū rú qí lái",meaning:"Happen suddenly; out of nowhere",cn:"一场突如其来的大雨，把毫无准备的游客们淋成了落汤鸡。",en:"A sudden downpour drenched the unprepared tourists to the skin."},
  {word:"忘年之交",pinyin:"wàng nián zhī jiāo",meaning:"Friendship despite age difference",cn:"七十岁的老画家和十几岁的少年成了忘年之交，常在一起作画。",en:"The seventy-year-old painter and the teenage boy became friends despite their age gap, often painting together."},
  {word:"我行我素",pinyin:"wǒ xíng wǒ sù",meaning:"Act in one's own way regardless",cn:"大家的劝告他全当耳边风，依旧我行我素。",en:"He treated everyone's advice as wind past his ears and went on doing as he pleased."},
  {word:"无可奈何",pinyin:"wú kě nài hé",meaning:"Helpless; nothing can be done",cn:"眼看着风筝越飞越远，他却无可奈何，只能干着急。",en:"Watching the kite drift farther away, he was helpless and could only fret."},
  {word:"无忧无虑",pinyin:"wú yōu wú lǜ",meaning:"Carefree; without worries",cn:"童年的时光无忧无虑，每天只知道玩耍和欢笑。",en:"Childhood was carefree, filled with nothing but play and laughter."},
  {word:"心安理得",pinyin:"xīn ān lǐ dé",meaning:"Feel at ease and justified",cn:"这钱是他凭本事挣来的，花起来心安理得。",en:"He earned this money by his own ability, so he spends it with a clear conscience."},
  {word:"心灰意冷",pinyin:"xīn huī yì lěng",meaning:"Disheartened; discouraged",cn:"连续几次面试都失败了，他渐渐变得心灰意冷。",en:"After several failed interviews in a row, he gradually grew disheartened."},
  {word:"心旷神怡",pinyin:"xīn kuàng shén yí",meaning:"Feel relaxed and happy",cn:"站在山顶眺望辽阔的大海，他感到心旷神怡。",en:"Standing on the peak gazing at the vast sea, he felt relaxed and joyful."},
  {word:"形影不离",pinyin:"xíng yǐng bù lí",meaning:"Inseparable",cn:"这对好朋友整天形影不离，上学放学都在一起。",en:"The two close friends are inseparable, together on the way to and from school."},
  {word:"兴致勃勃",pinyin:"xìng zhì bó bó",meaning:"In high spirits; enthusiastic",cn:"一听说要去野餐，孩子们个个兴致勃勃，欢呼雀跃。",en:"At the mention of a picnic, the children were all in high spirits, cheering and jumping."},
  {word:"虚情假意",pinyin:"xū qíng jiǎ yì",meaning:"Fake sincerity; hypocritical",cn:"他的关心只是虚情假意，背地里却处处算计你。",en:"His concern is mere pretense; behind your back he schemes against you at every turn."},
  {word:"一帆风顺",pinyin:"yī fān fēng shùn",meaning:"Smooth and successful",cn:"他的事业并非一帆风顺，而是历经了无数挫折。",en:"His career was far from smooth sailing; it endured countless setbacks."},
  {word:"一见如故",pinyin:"yī jiàn rú gù",meaning:"Feel like old friends at first meeting",cn:"两人虽然初次见面，却一见如故，聊得十分投机。",en:"Though meeting for the first time, the two hit it off like old friends and talked happily."},
  {word:"一举两得",pinyin:"yī jǔ liǎng dé",meaning:"Kill two birds with one stone",cn:"骑车上班既能锻炼身体，又能节省车费，真是一举两得。",en:"Cycling to work both exercises the body and saves fares — killing two birds with one stone."},
  {word:"一蹶不振",pinyin:"yī jué bù zhèn",meaning:"Collapse after one setback",cn:"失败并不可怕，可怕的是从此一蹶不振，失去信心。",en:"Failure isn't frightening; what's frightening is collapsing afterward and losing confidence."},
  {word:"一劳永逸",pinyin:"yī láo yǒng yì",meaning:"Once and for all",cn:"他想找个一劳永逸的办法，把问题彻底解决，省得反复操心。",en:"He wanted a once-and-for-all solution to settle the matter completely and save endless worry."},
  {word:"一鸣惊人",pinyin:"yī míng jīng rén",meaning:"Achieve sudden fame",cn:"这名默默无闻的选手在决赛中一鸣惊人，夺得了冠军。",en:"The little-known contestant stunned everyone in the final and won the championship."},
  {word:"一模一样",pinyin:"yī mú yī yàng",meaning:"Exactly the same",cn:"这对双胞胎长得一模一样，连妈妈有时也分不清。",en:"The twins look exactly alike — even their mother sometimes can't tell them apart."},
  {word:"一日千里",pinyin:"yī rì qiān lǐ",meaning:"Advance with leaps and bounds",cn:"近年来科技发展一日千里，新产品层出不穷。",en:"In recent years technology has advanced by leaps and bounds, with new products constantly emerging."},
  {word:"一心一意",pinyin:"yī xīn yī yì",meaning:"Wholeheartedly; single-minded",cn:"他一心一意地扑在科研上，几乎忘了吃饭睡觉。",en:"He devoted himself wholeheartedly to research, almost forgetting to eat or sleep."},
  {word:"怨天尤人",pinyin:"yuàn tiān yóu rén",meaning:"Blame others or fate",cn:"遇到挫折时，与其怨天尤人，不如反省自己。",en:"When you meet setbacks, rather than blaming fate and others, reflect on yourself."},
  {word:"跃跃欲试",pinyin:"yuè yuè yù shì",meaning:"Eager to try",cn:"看到别人玩滑板，他在一旁跃跃欲试，恨不得马上上场。",en:"Watching others skateboard, he was eager to try, itching to get on right away."},
  {word:"责无旁贷",pinyin:"zé wú páng dài",meaning:"Duty-bound; obligatory",cn:"保护环境，人人责无旁贷，谁也不能推卸。",en:"Protecting the environment is everyone's bounden duty; no one can shirk it."},
  {word:"展翅高飞",pinyin:"zhǎn chì gāo fēi",meaning:"Spread wings and soar",cn:"老师希望每个学生将来都能展翅高飞，实现自己的理想。",en:"The teacher hopes every student will one day spread their wings and realize their dreams."},
  {word:"郑重其事",pinyin:"zhèng zhòng qí shì",meaning:"Take something seriously",cn:"他郑重其事地许下承诺，一定会照顾好这个家。",en:"He solemnly made a promise that he would take good care of the family."},
  {word:"志同道合",pinyin:"zhì tóng dào hé",meaning:"Like-minded; share the same goals",cn:"几个志同道合的年轻人聚在一起，决心共同创业。",en:"A few like-minded young people came together, determined to start a business."},
  {word:"专心致志",pinyin:"zhuān xīn zhì zhì",meaning:"Concentrate wholeheartedly",cn:"他专心致志地做着实验，连有人进来都没察觉。",en:"He worked on the experiment with single-minded focus, not even noticing someone come in."},
  {word:"装腔作势",pinyin:"zhuāng qiāng zuò shì",meaning:"Pretentious; putting on airs",cn:"他明明什么都不懂，却偏要装腔作势，假装很专业。",en:"Though he knew nothing, he insisted on putting on airs and pretending to be an expert."},
  {word:"追根究底",pinyin:"zhuī gēn jiū dǐ",meaning:"Get to the bottom of things",cn:"对于不明白的问题，他总爱追根究底，非弄清楚不可。",en:"For anything he doesn't understand, he always gets to the bottom of it, insisting on clarity."},
  {word:"自暴自弃",pinyin:"zì bào zì qì",meaning:"Give up on oneself",cn:"一次考砸了不要紧，千万不能因此自暴自弃。",en:"Failing one exam doesn't matter; you must never give up on yourself because of it."},
  {word:"自得其乐",pinyin:"zì dé qí lè",meaning:"Find contentment in one's own way",cn:"他一个人在家养花、画画，自得其乐。",en:"Alone at home growing flowers and painting, he finds his own contentment."},
  {word:"自然而然",pinyin:"zì rán ér rán",meaning:"Naturally; as a matter of course",cn:"在中文环境里待久了，他的口语自然而然地流利了起来。",en:"After a long time in a Chinese-speaking environment, his spoken Chinese naturally became fluent."},
];

// ─── WORD DATA + 构词 ENGINE ──────────────────────────────────────────────────
// Dedup the syllabus list (the raw data had every word duplicated with blank
// pinyin / reset section). First occurrence wins — that's the clean half.
function uniqueByWord(arr) {
  const seen = new Set(), out = [];
  for (const it of arr) { if (seen.has(it.w)) continue; seen.add(it.w); out.push(it); }
  return out;
}
const SYLLABUS_WORDS = uniqueByWord(SYLLABUS_RAW);

const chs = (w) => [...w];

// One combined corpus of every word the app knows, used to derive 构词 examples.
const CORPUS = (() => {
  const set = new Set();
  IDIOMS.forEach(i => set.add(i.word));
  EXAM_WORDS.forEach(w => set.add(w.w));
  SYLLABUS_WORDS.forEach(w => set.add(w.w));
  [...CHAR_F, ...CHAR_L].forEach(g => g.words.forEach(w => set.add(w)));
  return [...set];
})();
const CORPUS2 = CORPUS.filter(w => chs(w).length === 2);

// Extra common 2-char Chinese words used ONLY as a fallback distractor pool for the 词语替换 quiz
// when the curated corpus has no one-character-swap candidate. Not used for 构词 or anywhere else.
const EXTRA_WORDS = ["朋友","家人","家庭","家乡","父亲","母亲","爸爸","妈妈","爷爷","奶奶","哥哥","姐姐","弟弟","妹妹","儿子","女儿","孙子","孙女","妻子","丈夫","夫妻","兄弟","姐妹","叔叔","阿姨","舅舅","姑姑","表哥","表姐","表弟","表妹","堂哥","堂姐","老师","学生","同学","同事","同伴","同行","同胞","同仁","老板","工人","农民","商人","客人","主人","男人","女人","大人","小孩","孩子","儿童","少年","青年","老人","头发","眼睛","鼻子","嘴巴","耳朵","牙齿","舌头","脖子","肩膀","手臂","手指","手掌","手心","手背","脚趾","脚尖","脚跟","皮肤","心脏","大脑","骨头","肌肉","血液","神经","脸庞","面孔","面容","容貌","米饭","面条","包子","饺子","馒头","油条","豆浆","牛奶","鸡蛋","蔬菜","水果","苹果","香蕉","葡萄","西瓜","草莓","桃子","梨子","柠檬","橘子","番茄","黄瓜","萝卜","白菜","菠菜","茄子","辣椒","大蒜","生姜","香菜","鸡肉","猪肉","牛肉","羊肉","鱼肉","海鲜","食物","食品","美食","早餐","午餐","晚餐","夜宵","早饭","午饭","晚饭","学校","医院","银行","邮局","公园","商店","市场","超市","餐厅","饭店","酒店","宾馆","旅馆","教室","工厂","车间","农村","乡下","城市","都市","城镇","乡镇","街道","马路","公路","桥梁","隧道","车站","机场","港口","码头","海岸","海边","河流","湖泊","山脉","森林","沙漠","草原","田野","农田","池塘","大海","大山","起床","睡觉","上班","下班","上学","放学","锻炼","散步","跑步","游泳","打球","打牌","下棋","唱歌","跳舞","画画","写字","读书","看书","听课","上课","下课","答题","测量","比赛","表演","演奏","弹琴","邀请","应邀","出席","出去","进来","进入","起立","起飞","起步","离家","到家","回家","回头","回去","回来","转身","前进","后退","倒退","抵达","出发","启程","告辞","告知","通告","公告","报告","报道","报名","报到","转告","转交","传达","显示","显出","表明","表白","说明","解答","处理","办理","管理","治理","整理","修建","修复","修养","培育","培训","教导","训练","实习","演习","复习","借阅","借助","利用","使用","应用","启用","启动","启发","启示","进展","开始","开展","开拓","开发","开放","开机","关闭","关门","关注","关爱","注意","注视","注目","注入","今天","明天","昨天","后天","前天","早上","中午","下午","晚上","半夜","凌晨","今晚","明晚","昨晚","今早","明早","昨夜","今夜","片刻","瞬间","长期","短期","近期","古代","现代","当代","同时","此时","此刻","即时","顿时","平时","时光","时代","时期","时间","时候","时机","时尚","时髦","一时","一同","一起","一齐","一道","一路","一并","一段","一律","片面","表面","局面","见面","会面","场面","当面","正面","反面","侧面","界面","水面","湖面","海面","地面","桌面","墙面","路面","门面","上面","下面","前面","后面","左边","右边","中间","周围","四周","内部","外部","外面","里面","当地","本地","外地","外国","我国","各地","各种","各类","各样","各色","各位","这里","那里","这边","那边","这些","那些","这样","那样","这种","那种","这般","那般","我们","你们","他们","她们","它们","别人","大家","任何","某些","某种","某个","其他","别的","自身","自我","自动","因为","所以","但是","然而","不过","可是","虽然","尽管","即使","假如","假设","如果","倘若","哪怕","万一","否则","不然","不如","不止","不必","不妨","不要","不见","不愧","还要","还是","也是","仍然","仍旧","总是","总要","总归","居然","竟然","既然","即将","即可","即刻","假使","哪儿","由于","鉴于","加以","予以","借以","用以","据此","由此","至此","从此","从来","从前","从今","当前","当时","当今","目前","现在","过去","将来","未来","何况","何必","何须","何尝","何时","何处","何来","何在","之内","之外","之间","之中","之前","之后","之上","之下","至今","至少","至多","至于","直到","一直","一向","一旦","一举","凡是","不但","不仅","不论","不料","不顾","偏偏","反而","反正","反倒","反复","重新","再次","再度","一再","屡次","多次","头部","眉毛","胡子","下巴","胸口","胃部","肝脏","肾脏","心情","心境","心声","心思","心血","心愿","心意","心怀","主意","主义","主张","主任","主席","主流","主管","主权","主体","总统","总理","部长","局长","处长","科长","组长","班长","队长","校长","院长","会长","厂长","海洋","海风","海浪","海军","海港","河水","河岸","河边","湖水","湖光","山顶","山腰","山脚","山下","山间","山区","山林","树木","树叶","树枝","树根","花朵","花瓣","花园","花草","小草","青草","野草","稻谷","稻田","麦子","麦田","桃树","梨树","松树","柏树","柳树","果树","果园","果实","桃花","梨花","菊花","荷花","梅花","兰花","春天","夏天","秋天","冬天","春风","春雨","春光","春色","秋风","秋雨","秋色","秋日","冬日","冬雪","寒风","暖风","北风","南风","东风","西风","太阳","月亮","星星","星空","天空","天边","云朵","云海","云彩","雨水","雨滴","雪花","雪山","雷声","闪电","彩虹","风雨","风雪","风霜","风云","风沙","空气","气候","气温","气流","气息","气味","氛围","蓝天","白云","乌云","晴天","阴天","雨天","雪天","白天","黑夜","昼夜","清晨","黄昏","日出","日落","日光","月光","星光","阳光","灯光","电灯","电视","电话","电脑","电影","电池","电缆","电线","电波","电流","电场","数学","语文","英语","物理","化学","生物","历史","地理","音乐","美术","体育","政治","经济","文化","教育","科技","信息","数据","技术","工艺","工程","项目","计划","方案","文件","资料","材料","书本","书包","课本","笔记","笔画","钢笔","铅笔","毛笔","橡皮","尺子","纸张","纸条","信件","邮件","邮票","邮箱","信封","贺卡","卡片","名片","奖状","证书","票据","收据","账单","账户","账本","存折","钱包","钱币","硬币","纸币","银两","汽车","火车","飞机","轮船","船只","公车","出租","巴士","地铁","马车","自行","摩托","战车","骑车","开车","坐车","乘车","上车","下车","驾驶","驾车","骑马","骑驴","菜园","校园","乐园","家园","战场","操场","会场","商场","广场","剧场","球场","赛场","战役","战争","战斗","战士","士兵","军人","军队","部队","小队","班级","年级","学期","学年","学位","学历","课程","课堂","课文","课时","作业","作品","作文","作家","作者","画家","歌手","明星","名人","伟人","凡人","好人","坏人","友人","敌人","路人","行人","客户","顾客","乘客","旅客","游客","观众","听众","群众","民众","公众","大众","百姓","居民","村民","市民","公民","国民","人民","平民","选民","选手","队员","会员","成员","职员","公务","事务","任务","义务","职务","职责","职位","职称","职业","行业","事业","企业","工业","农业","商业","服务","贸易","进口","出口","买卖","买家","卖家","员工","员额","岗位","工位","座位","位置","位于","所在","所有","所属","属于","所谓","所幸","幸亏","幸运","幸福","美满","和谐","和睦","团结","团圆","团队","团体","集体","群体","个体","客体","本体","本质","本能","本性","本意","本来","本身","本人","本市","本国","本年","本月","本周","本日","开心","快乐","愉快","欢乐","欢喜","兴奋","激动","满意","惊喜","惊讶","吃惊","震惊","震撼","感动","感激","感谢","感慨","感觉","感受","感想","感情","感官","难过","伤心","悲伤","痛苦","苦恼","烦恼","忧愁","忧伤","害怕","恐惧","惊慌","慌张","慌乱","紧张","紧绷","松弛","放松","轻松","轻快","沉重","沉闷","郁闷","忧郁","抑郁","枯燥","乏味","无趣","有趣","有意","无意","随意","在意","愿意","乐意","得意","失意","原意","好意","恶意","真意","深意","真心","诚心","耐心","爱心","良心","责任","权利","权力","权益","权威","威望","威严","威信","威力","实力","实效","效率","效果","成效","成绩","成就","成果","成败","胜利","失利","胜负","盈亏","得失","利弊","好坏","优劣","高低","上下","左右","前后","内外","深浅","宽窄","粗细","厚薄","松紧","软硬","冷热","干湿","明暗","清浊","真假","虚实","曲直","方圆","长短","远近","早晚","快慢","多少","大小","老幼","男女","老少","贫富","贵贱","胖瘦","美丑","俊丑","参与","与会","给与","极其","尤其","其中","其余","其实","偶尔","偶然","木偶","配偶","想象","画像","图像","录像","雕像","头像","形象","印象","充满","充分","充足","冒犯","冒充","感冒","危险","风险","保险","探险","历险","凋零","凋落","答谢","致谢","道谢","减少","减小","减弱","减肥","年轻","轻视","创造","创新","创立","创办","创业","建设","建造","建议","建筑","建立","制度","制定","制造","制止","限制","控制","抑制","衣服","西服","校服","服装","服从","信服","佩服","屈服","征服","区域","地区","城区","区分","告别","分别","离别","特别","单独","单一","单调","名单","菜单","纯净","纯粹","清纯","变化","变动","改变","演变","突变","迁移","搬迁","拆迁","乔迁","升迁","方向","走向","趋向","倾向","朝向","向上","向下","向前","往年","往日","往事","往来","往返","前往","物品","商品","产品","用品","礼品","品质","品德","品味","评价","评论","评估","批评","点评","声音","声明","声调","大声","小声","名声","风声","钟声","笑声","哭声","荣誉","名誉","信誉","美誉","振奋","勤奋","奋发","奋力","斗争","婉言","委婉","婉拒","旋转","转移","转变","转弯","周转","好转","孤单","孤立","孤儿","独立","独自","独特","品尝","尝鲜","考试","测试","面试","笔试","口试","广大","广阔","广博","广告","泛滥","作弊","端正","端午","极端","尖端","开端","末端","顶端","阴影","影子","摄影","倒影","响声","响应","怀念","怀疑","怀旧","关怀","抱怨","抱负","拥抱","悠然","悠闲","悠扬","长久","永久","持久","良久","或许","读者","学者","智者","长者","看见","听见","知道","明白","了解","理解","懂得","记得","想起","想念","思念","思考","思想","思维","决定","决心","决策","选择","选举","推选","推举","推荐","推动","推广","推进","讨论","谈话","谈论","议论","说话","说服","说法","描写","描绘","描述","叙述","陈述","阐述","介绍","谈判","协商","协议","协定","协调","协助","合作","合伙","合同","合法","合理","合适","适合","适当","适用","适应","反对","同意","赞同","赞成","通过","否决","接收","接到","接近","接连","接着","紧接","直接","间接","立刻","马上","当即","转眼","转瞬","刹那","顷刻","须臾","始终","终究","毕竟","终归","通常","平日","日常","每天","每日","每月","每年","科学","法律","道德","礼貌","礼仪","仪式","仪表","美貌","可怕","可观","可行","可靠","可信","善良","凶恶","残忍","残酷","温柔","严厉","严格","严肃","必要","必须","必然","必定","一定","假定","镇静","平静","安静","寂静","静止","静谧","沉静","沉迷","沉睡","寂寞","严密","保密","机密","秘密","紧密","致密","稠密","解释","解放","解散","解约","注解","谅解","和解","调解","误解","瓦解","见解","图书","书写","书法","书架","书房","书桌","书店","书签","图画","图案","图纸","图表","地图","版图","蓝图","海图","路图","风景","风光","风波","风暴","风趣","风度","景色","景物","景象","好友","战友","战马","战火","战乱","乱世","乱说","乱跑","胡说","胡乱","胡同","胡闹","乱想","狂想","幻想","梦想","空想","遐想","奇想","设想","臆想","构想","畅想","联想","遥想","深想","回想","误判","判断","判决","判定","审判","审讯","审议","审视","审定","公审","会审","主审","技能","技巧","学派","学风","学界","学说","学术","学海","学童","儒学","求学","好学","治学","学子","学府","学究","学问","问候","问世","问询","询问","盘问","查问","质问","追问","逼问","问答","问题","难题","试题","课题","主题","标题","话题","专题","议题","选题","原题","审题","解题","出题","影像","演技","巧妙","灵巧","精巧","抗拒","推拒","杜绝","灭绝","断绝","谢绝","拘禁","拘留","不拘","结束","约束","管束","指挥","指示","指点","指南","指责","引导","引起","引申","吸引","牵引","招引","挑选","挑剔","挑拨","作战","内战","抗战","决战","挣钱","挣脱","包扎","振作","振兴","共振","奋勇","捕捉","捕获","逮捕","打捞","措辞","实施","设施","施工","施加","揣测","琢磨","抚摩","敏感","敏锐","灵敏","快捷","便捷","意志","立志","同志","标志","壮志","杂志","替换","换车","交换","转换","更改","更新","更正","枯萎","衰竭","标语","精准","瞄准","批准","基准","水准","对准","检查","检举","检测","探讨","商讨","研讨","楷书","模型","模仿","模式","规模","劳模","含糊","迷糊","糊涂","山沟","普通","流通","交通","通信","活动","活力","活跃","泼水","泼辣","淹死","埋没","沉没","出没","吞没","光滑","滑动","灌溉","运输","传输","输液","输血","输赢","灵活","灵魂","心灵","反感","厌倦","厌恶","压迫","逼迫","强迫","急迫","胁迫","压力","压抑","拘谨","严谨","谨慎","谨记","严重","严正","严寒","酷暑","暑假","寒假","寒冷","严冬","寒冬","凛冽","凌乱","欺凌","凌空","攻击","袭击","射击","打击","出击","反击","回击","围攻","进攻","主攻","助攻","侵犯","触犯","违犯","犯罪","犯规","作案","破案","案件","案例","案情","档案","选项","项链","事项","款项","专项","款式","款待","存款","汇款","付款","赔款","奖项","奖金","奖品","奖牌","奖学","金牌","奖励","鼓励","激励","勉励","奋勉","勉强","顽强","坚强","加强","增强","强大","强壮","强烈","强力","壮大","壮观","壮丽","壮举","观察","观看","观点","观念","观赏","观光","观望","乐观","悲观","客观","主观","直观","景观","气概","气派","派遣","派别","派出","正派","流派","党派","派系","系统","系列","体系","关系","联系","直系","姓氏","名字","字典","字母","字眼","字幕","字句","字画","识字","字音","字形","字面","词典","词语","词汇","名词","动词","副词","形词","代词","虚词","实词","专词","新词","古词","成语","熟语","俗语","谚语","谜语","术语","用语","话语","言语","语气","语调","语速","语义","语法","语音","语句","语态","声韵","韵律","韵味","音律","旋律","节律","节奏","节制","调节","季节","环节","章节","细节","关节","春节","佳节","中秋","清明","元宵","中元","重阳","元旦","除夕","新年","跨年","元月","正月","腊月","年初","年末","年终","年底","年代","历代","近代","明代","清代","唐代","宋代","汉代","世纪","千年","百年","数年","数月","数日","数次","几次","数百","数千","数万","上百","上千","上万","几乎","几许","少许","稍许","稍微","略微","稍稍","略略","渐渐","慢慢","快快","常常","往往","时时","处处","步步","点点","句句","次次","回回","趟趟","遍遍","秒秒","分分","刻刻","年年","月月","日日","天天","次第","秩序","顺序","序号","序言","次序","先后","前者","后者","前辈","后辈","长辈","晚辈","同辈","平辈","世代","代代","代价","代表","代理","代办","代课","代笔","代写","代购"];

const startsWith = (ch, not) => CORPUS2.filter(w => w !== not && chs(w)[0] === ch);
const endsWith   = (ch, not) => CORPUS2.filter(w => w !== not && chs(w)[1] === ch);

// 构词 for a 2-char word AB → words using A/B in first/last position.
function buildGouci(word, limit = 8) {
  const c = chs(word);
  if (c.length !== 2) return null;
  const [a, b] = c;
  return {
    a, b,
    AX: startsWith(a, word).slice(0, limit), // A 在首
    XA: endsWith(a, word).slice(0, limit),   // A 在尾
    BX: startsWith(b, word).slice(0, limit), // B 在首
    XB: endsWith(b, word).slice(0, limit),   // B 在尾
  };
}

// Real 2-char words differing from `word` by exactly one character (same
// position) — used as plausible distractors in the 词语替换 quiz.
function oneCharVariants(word) {
  const c = chs(word);
  if (c.length !== 2) return [];
  const [a, b] = c;
  return CORPUS2.filter(w => {
    if (w === word) return false;
    const x = chs(w);
    const sa = x[0] === a, sb = x[1] === b;
    return (sa && !sb) || (!sa && sb);
  });
}

const wordInfo = (word) => WORD_DATA[word] || null;
function pinyinOf(word) {
  const wd = WORD_DATA[word]; if (wd && wd.py) return wd.py;
  const s = SYLLABUS_WORDS.find(w => w.w === word); if (s && s.py) return s.py;
  const id = IDIOMS.find(i => i.word === word); if (id) return id.pinyin;
  return '';
}

// ─── SM-2 ─────────────────────────────────────────────────────────────────────
const A = '#D85A30';
const TC = { '成语':{bg:'#FAECE7',text:'#993C1D'}, '关联词':{bg:'#E6F1FB',text:'#185FA5'}, '叠字':{bg:'#EAF3DE',text:'#3B6D11'}, '普通词':{bg:'#FAEEDA',text:'#854F0B'} };

function applyRating(card = {}, quality) {
  let { interval = 0, reps = 0, ef = 2.5 } = card;
  if (quality < 3) { reps = 0; interval = 1; }
  else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps++;
    ef = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  const d = new Date(); d.setDate(d.getDate() + interval);
  return { interval, reps, ef: +ef.toFixed(3), nextReview: d.toISOString().slice(0, 10) };
}

function iLabel(c) {
  if (!c || c.reps === 0) return c ? 'Soon' : 'New';
  const i = c.interval;
  if (i === 1) return '1d'; if (i < 7) return i + 'd';
  if (i < 30) return Math.round(i / 7) + 'w'; return Math.round(i / 30) + 'mo';
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const IDIOM_SET = new Set(IDIOMS.map(i => i.word));
const STUDY_ITEMS = (() => {
  const out = [];
  for (const [w, d] of Object.entries(WORD_DATA)) {
    if (!d || !d.sentence) continue;
    out.push({ word: w, pinyin: d.py, meaning: d.meaning, enGloss: d.en, cn: d.sentence, en: d.sentenceEn, isIdiom: IDIOM_SET.has(w) });
  }
  return out;
})();
const NEW_PER_SESSION = 20;

// Adaptive picker (task 5): wrong-answer bank > due > never-seen > anything.
function pickAdaptive(pool, cards, wrong) {
  if (!pool || !pool.length) return null;
  const today = todayStr();
  const take = a => a[Math.floor(Math.random() * a.length)];
  const wrongList = wrong ? pool.filter(i => wrong[i.word]) : [];
  const dueList = cards ? pool.filter(i => { const c = cards[i.word]; return c && c.nextReview && c.nextReview <= today; }) : [];
  const unseen = cards ? pool.filter(i => !cards[i.word]) : [];
  const r = Math.random();
  if (wrongList.length && r < 0.40) return take(wrongList);
  if (dueList.length && r < 0.70) return take(dueList);
  if (unseen.length && r < 0.95) return take(unseen);
  return take(pool);
}

function buildDeck(cards) {
  const today = todayStr();
  const due = shuffle(STUDY_ITEMS.filter(i => { const c = cards[i.word]; return c && c.nextReview && c.nextReview <= today; }));
  const newC = shuffle(STUDY_ITEMS.filter(i => !cards[i.word])).slice(0, NEW_PER_SESSION);
  return [...due, ...newC];
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function lLoad(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Badge = ({ type, children, style = {} }) => {
  const c = TC[type] || { bg: '#EEE', text: '#555' };
  return <span style={{ display:'inline-block', fontSize:11, padding:'2px 7px', borderRadius:20, fontWeight:600, background:c.bg, color:c.text, ...style }}>{children || type}</span>;
};

// ─── AUDIO (browser TTS, zh-CN) ───────────────────────────────────────────────
function speak(text) {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85;
    const vs = window.speechSynthesis.getVoices() || [];
    const v = vs.find(x => /zh[-_]?(CN|Hans)/i.test(x.lang)) || vs.find(x => /^zh/i.test(x.lang));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
const SpeakBtn = ({ text, size = 15, style = {} }) => (
  <button onClick={e => { e.stopPropagation(); speak(text); }} aria-label="朗读 Read aloud" title="朗读 Read aloud"
    style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:size, color:A, padding:'6px 8px', lineHeight:1, flexShrink:0, ...style }}>🔊</button>
);

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ fontSize:12, padding:'5px 11px', borderRadius:20, border:`1px solid ${active ? A : '#E0E0DC'}`, background: active ? '#FAECE7' : 'transparent', color: active ? '#993C1D' : '#888', cursor:'pointer', whiteSpace:'nowrap' }}>
    {children}
  </button>
);

const Card = ({ children, style = {}, ...p }) => (
  <div style={{ background:'white', border:'1px solid #E8E8E4', borderRadius:14, padding:'18px 16px', ...style }} {...p}>{children}</div>
);

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({ cards, streak, todayCount, setTab, wrongCount = 0 }) {
  const today = todayStr();
  const reviewed = STUDY_ITEMS.filter(i => cards[i.word] && cards[i.word].reps > 0).length;
  const due = STUDY_ITEMS.filter(i => { const c = cards[i.word]; return c && c.nextReview <= today; }).length;
  const newC = STUDY_ITEMS.filter(i => !cards[i.word]).length;
  const pct = Math.round(reviewed / STUDY_ITEMS.length * 100);
  const r = 22, circ = 2 * Math.PI * r;

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#1A0E06,#4A2010)', borderRadius:14, padding:'16px 18px', marginBottom:12, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:36, lineHeight:1 }}>{'🔥'.repeat(Math.min(Math.max(streak, 1), 5))}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:26, fontWeight:700, color:'#FFD27F', lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:12, color:'#C9956A', marginTop:2 }}>day streak · {todayCount} reviewed today</div>
        </div>
        {streak >= 7 && <div style={{ fontSize:24 }}>🏆</div>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:9, marginBottom:12 }}>
        {[{label:'Due today',val:due,col:'#FCEBEB',tc:'#A32D2D',icon:'📋'},{label:'New cards',val:newC,col:'#E6F1FB',tc:'#185FA5',icon:'✨'},{label:'Mastered',val:reviewed,col:'#EAF3DE',tc:'#3B6D11',icon:'✅'}].map(({ label, val, col, tc, icon }) => (
          <div key={label} style={{ background:col, borderRadius:12, padding:'12px 6px', textAlign:'center' }}>
            <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
            <div style={{ fontSize:20, fontWeight:700, color:tc }}>{val}</div>
            <div style={{ fontSize:11, color:tc, opacity:0.85 }}>{label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <svg width={56} height={56} viewBox="0 0 60 60">
            <circle cx={30} cy={30} r={r} fill="none" stroke="#F0F0EC" strokeWidth={5} />
            <circle cx={30} cy={30} r={r} fill="none" stroke={A} strokeWidth={5}
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round" transform="rotate(-90 30 30)" style={{ transition:'stroke-dashoffset 0.5s' }} />
            <text x={30} y={35} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1A1A18">{pct}%</text>
          </svg>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:14, color:'#1A1A18', marginBottom:3 }}>Idiom Progress</div>
            <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>{reviewed} of {IDIOMS.length} reviewed</div>
            <div style={{ height:4, background:'#F0F0EC', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:A, borderRadius:2, transition:'width 0.5s' }} />
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
        {[
          { tab:'review', icon:'📖', label:'成语 Idioms', sub: due > 0 ? `${due} cards due` : 'Spaced-repetition review', hi:true },
          { tab:'quiz', icon:'🎯', label:'Quick Quiz', sub:'4 quiz modes' },
          { tab:'wrong', icon:'📕', label:'错题本 Wrong Answers', sub: wrongCount > 0 ? wrongCount + ' words to revise' : 'Empty — nothing missed yet', hi: wrongCount > 0 },
          { tab:'examwords', icon:'📋', label:'Past Exam Words', sub:`${EXAM_WORDS.length} words (2014–2026)` },
          { tab:'syllabus', icon:'📚', label:'Syllabus Words', sub:`${SYLLABUS_WORDS.length} words, Sec 1–4` },
          { tab:'chars', icon:'🔤', label:'Character Groups', sub:'构词 · 词语替换 practice' },
          { tab:'more', icon:'⚙️', label:'Progress & Export', sub:'Export revision sheet' },
        ].map(({ tab, icon, label, sub, hi }) => (
          <button key={tab} onClick={() => setTab(tab)} style={{ padding:'13px', border:`${hi ? '1.5px' : '1px'} solid ${hi ? A : '#E8E8E4'}`, borderRadius:12, background: hi ? '#FAECE7' : 'white', cursor:'pointer', textAlign:'left' }}>
            <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
            <div style={{ fontWeight:600, fontSize:13, color: hi ? '#993C1D' : '#1A1A18' }}>{label}</div>
            <div style={{ fontSize:11, color: hi ? '#C9956A' : '#888', marginTop:2 }}>{sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── REVIEW ───────────────────────────────────────────────────────────────────
function Review({ cards, onRate, onAnswer }) {
  const [deck, setDeck] = useState(() => buildDeck(cards));
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const today = todayStr();
  const card = deck[idx];

  const rate = (q) => {
    if (!card) return;
    onAnswer(); onRate(card.word, q); setDone(n => n + 1);
    const ni = idx + 1;
    if (ni >= deck.length) { setDeck(buildDeck(cards)); setIdx(0); } else setIdx(ni);
    setRevealed(false);
  };

  if (!card) return (
    <Card style={{ textAlign:'center', padding:'48px 20px' }}>
      <div style={{ fontSize:36, marginBottom:12 }}>🎉</div>
      <p style={{ fontWeight:600, fontSize:15, color:'#1A1A18', marginBottom:6 }}>All caught up!</p>
      <p style={{ fontSize:13, color:'#888' }}>Come back tomorrow for your next session.</p>
    </Card>
  );

  const cd = cards[card.word];
  const isNew = !cd, isDue = cd && cd.nextReview <= today;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
        <span style={{ fontSize:11, color:'#AAA' }}>{idx + 1}/{deck.length} · {done} done</span>
        <div style={{ display:'flex', gap:5 }}>
          {isNew && <Badge type="关联词">New</Badge>}
          {isDue && !isNew && <Badge type="成语" style={{ background:'#FCEBEB', color:'#A32D2D' }}>Due</Badge>}
        </div>
      </div>
      <div style={{ height:3, background:'#F0F0EC', borderRadius:2, overflow:'hidden', marginBottom:14 }}>
        <div style={{ height:'100%', width:`${Math.round(idx / deck.length * 100)}%`, background:A, transition:'width 0.3s' }} />
      </div>
      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
          <p style={{ fontSize:54, fontWeight:300, color:'#1A1A18', margin:'0 0 5px', lineHeight:1.1, fontFamily:'serif' }}>{card.word}</p>
          <SpeakBtn text={card.word} size={19} />
        </div>
        {!revealed ? (
          <>
            <button onClick={() => setRevealed(true)} style={{ fontSize:14, padding:'9px 24px', border:'1px solid #E0E0DC', borderRadius:9, background:'#FAFAF8', cursor:'pointer', color:'#1A1A18', display:'block', margin:'18px auto 0' }}>
              Reveal meaning
            </button>
            <p style={{ fontSize:11, color:'#BBB', textAlign:'center', marginTop:8 }}>Study the characters first</p>
          </>
        ) : (
          <>
            <p style={{ fontSize:15, color:A, marginBottom:4 }}>{card.pinyin}</p>
            <p style={{ fontSize:17, fontWeight:600, color:'#1A1A18', marginBottom:2 }}>{card.meaning}</p>
            {card.enGloss && <p style={{ fontSize:12, color:'#999', marginBottom:10 }}>{card.enGloss}</p>}
            <div style={{ background:'#FAFAF8', borderRadius:8, padding:'9px 12px', marginBottom:14, border:'1px solid #F0F0EC' }}>
              <p style={{ fontSize:13, color:'#1A1A18', marginBottom:2, lineHeight:1.6 }}>{card.cn}</p>
              <p style={{ fontSize:11, color:'#888', lineHeight:1.5 }}>{card.en}</p>
            </div>
            <p style={{ fontSize:11, color:'#AAA', textAlign:'center', marginBottom:7 }}>How well did you know this?</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5 }}>
              {[
                { q:1, e:'😵', l:'Again', s:'Forgot', bg:'#FCEBEB', bc:'#F09595', tc:'#A32D2D' },
                { q:3, e:'😓', l:'Hard', s:'Struggled', bg:'#FEF3E2', bc:'#F5C77C', tc:'#8A5E00' },
                { q:4, e:'🙂', l:'Good', s:'Got it', bg:'#EAF3DE', bc:'#97C459', tc:'#3B6D11' },
                { q:5, e:'⚡', l:'Easy', s:'Instant!', bg:'#E6F1FB', bc:'#80B8F0', tc:'#185FA5' },
              ].map(({ q, e, l, s, bg, bc, tc }) => (
                <div key={q} style={{ textAlign:'center' }}>
                  <button onClick={() => rate(q)} style={{ width:'100%', padding:'12px 3px', border:`1px solid ${bc}`, borderRadius:9, background:bg, cursor:'pointer', color:tc }}>
                    <div style={{ fontSize:16, marginBottom:1 }}>{e}</div>
                    <div style={{ fontWeight:600, fontSize:11 }}>{l}</div>
                    <div style={{ fontSize:11, opacity:0.8 }}>{s}</div>
                  </button>
                  <div style={{ fontSize:11, color:'#CCC', marginTop:2 }}>{iLabel(applyRating(cd, q))}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
// A sentence is only usable in a fill-in-the-blank quiz if, once the target
// word is removed, enough context remains to make the answer determinable.
function hasContext(sentence, word) {
  if (!sentence || !sentence.includes(word)) return false;
  const rest = sentence.replace(word, '');
  const cjk = [...rest].filter(c => /[\u4e00-\u9fff]/.test(c)).length;
  return cjk >= 8 || /[，；、：—]/.test(rest); // a clause/comma counts as context
}

// Pool of every word that has a context-rich example sentence (idioms + data).
function buildSentencePool() {
  const arr = [];
  IDIOMS.forEach(i => arr.push({ word: i.word, sentence: i.cn, en: i.en, meaning: i.meaning, collocations: [], confusables: [] }));
  Object.entries(WORD_DATA).forEach(([w, d]) => {
    if (d.sentence) arr.push({ word: w, sentence: d.sentence, en: d.sentenceEn, meaning: d.meaning, collocations: d.collocations || [], confusables: d.confusables || [] });
  });
  const seen = new Set();
  return arr.filter(x => hasContext(x.sentence, x.word) && !seen.has(x.word) && seen.add(x.word));
}

// Interchangeable synonyms: words in the same group must never be offered against one
// another in 词语替换 / 选词填空 (if one is the answer, the other isn't "wrong"). Covers
// the curated confusables plus near-synonyms a distractor search might surface.
const SYN_GROUPS = [
  ['再三','屡次'], ['精准','精确'],
  ['蓦然','忽然','突然'], ['大概','大约','大致'], ['著名','闻名','知名'], ['姊妹','姐妹'], ['牢记','铭记'],
  ['调皮','顽皮','淘气'], ['内疚','愧疚'], ['延误','耽误'], ['凝望','凝视'],
  ['讥讽','嘲讽','讥笑'], ['愤怒','恼怒','暴怒','愤恨'], ['抵挡','抵抗'],
  ['稀少','稀有'], ['获得','获取'], ['推进','推动'], ['惊讶','惊奇'],
  ['寂寞','孤独','孤单'], ['仿佛','好像','似乎'], ['漂亮','美丽'],
  ['坦率','直率'], ['磋商','协商','洽商'],
  ['忠实','忠诚','忠心'], ['清晰','清楚','明晰'], ['汲取','吸取'],
  ['鉴赏','欣赏'], ['真挚','真诚','诚挚'],
  ['恰好','刚好','正好'], ['开销','开支'],
  ['谦虚','谦逊'], ['疆界','边界'], ['庞大','巨大'], ['落伍','落后'],
  ['诠释','解释','阐释'], ['残障','残疾'], ['贫穷','贫困','贫苦'],
];
const SYN = (() => { const m = {}; for (const g of SYN_GROUPS) for (const w of g) { (m[w] = m[w] || new Set()); g.forEach(o => { if (o !== w) m[w].add(o); }); } return m; })();
const synSetOf = w => SYN[w] || null;

function Quiz({ onAnswer, onWrong, cards, wrong }) {
  const [mode, setMode] = useState('menu');
  const [q, setQ] = useState(null);          // meaning quiz
  const [sel, setSel] = useState(null);
  const [sq, setSq] = useState(null);        // sentence-based quizzes (exam / collocation / replace)
  const [sqSel, setSqSel] = useState(null);
  const [score, setScore] = useState({ c: 0, t: 0 });

  const sentencePool = useMemo(buildSentencePool, []);
  // 词语替换 uses ONLY curated distractors (verified wrong-in-context one-char swaps),
  // so the quiz can never show an accidental synonym. Words without 3 curated
  // distractors simply don't appear in this mode.
  const replacePool = useMemo(() => sentencePool.filter(x => {
    if (chs(x.word).length !== 2) return false;
    if (!x.confusables || x.confusables.length < 3) return false;
    const synSet = synSetOf(x.word);
    // Keep only headwords where at least one NON-synonym confusable can serve as the
    // "wrong" word with ≥3 NON-synonym distractors sharing one char with it.
    return x.confusables.some(cand => {
      if (synSet && synSet.has(cand)) return false;
      const cs = chs(cand); if (cs.length !== 2) return false;
      const [c, d] = cs;
      const used = new Set([x.word, cand]);
      const sharesOne = w => { const wcs = chs(w); return wcs.length === 2 && !used.has(w) && !(synSet && synSet.has(w)) && ((wcs[0] === c) !== (wcs[1] === d)); };
      let count = x.confusables.filter(y => y !== cand && sharesOne(y)).length;
      if (count >= 3) return true;
      count += startsWith(c, cand).filter(sharesOne).length + endsWith(d, cand).filter(sharesOne).length;
      if (count >= 3) return true;
      count += EXTRA_WORDS.filter(sharesOne).length;
      return count >= 3;
    });
  }), [sentencePool]);
  const collocationPool = useMemo(() => sentencePool.filter(x => x.collocations && x.collocations.length), [sentencePool]);

  const newMQ = useCallback(() => {
    const cor = pickAdaptive(STUDY_ITEMS, cards, wrong) || STUDY_ITEMS[0];
    const syn = synSetOf(cor.word);
    const pool = shuffle(STUDY_ITEMS).filter(o => o.word !== cor.word && o.meaning && !(syn && syn.has(o.word)));
    const opts = shuffle([cor, ...pool.slice(0, 3)]);
    const byM = Math.random() > 0.5;
    setQ({ qid: Date.now(), word: cor.word, prompt: byM ? `What does "${cor.word}" (${cor.pinyin}) mean?` : `Which word means "${cor.meaning}"?`, opts: opts.map(o => ({ label: byM ? o.meaning : o.word, word: o.word, sub: byM ? '' : o.pinyin, isC: o.word === cor.word })) });
    setSel(null);
  }, [cards, wrong]);

  // Exam fill-in-blank (idioms): blank the idiom, choose among 4 idioms.
  const examIdioms = useMemo(() => IDIOMS.filter(i => hasContext(i.cn, i.word)), []);
  const newExamQ = useCallback(() => {
    const base = examIdioms.length >= 4 ? examIdioms : IDIOMS;
    const cor = pickAdaptive(base, cards, wrong) || base[0];
    const distract = shuffle(IDIOMS.filter(i => i.word !== cor.word)).slice(0, 3);
    setSq({ qid: Date.now(), kind: 'exam', badge: '填空 · Fill in the blank', prompt: 'Choose the idiom that fits.', sub: `意思：${cor.meaning}`, sentence: cor.cn.replace(cor.word, '＿＿＿＿'),
      word: cor.word, meaning: cor.meaning, opts: shuffle([cor, ...distract]).map(o => ({ word: o.word, isC: o.word === cor.word })) });
    setSqSel(null);
  }, [examIdioms, cards, wrong]);

  // 选词填空: blank the word in its sentence; pick the word that fits the context/collocation.
  const newCollocationQ = useCallback(() => {
    const pool = collocationPool.length >= 4 ? collocationPool : sentencePool;
    const item = pickAdaptive(pool, cards, wrong) || pool[0];
    const len = chs(item.word).length;
    const ic = chs(item.word);
    const synSet = synSetOf(item.word);
    // distractors of the same length that share NO character with the answer and are
    // not synonyms of it, so a wrong option can't accidentally also read correctly.
    let distract = shuffle(pool.filter(x => x.word !== item.word && chs(x.word).length === len && !(synSet && synSet.has(x.word)) && !chs(x.word).some(c => ic.includes(c)))).slice(0, 3);
    if (distract.length < 3) distract = shuffle(pool.filter(x => x.word !== item.word && chs(x.word).length === len && !(synSet && synSet.has(x.word)))).slice(0, 3);
    setSq({ qid: Date.now(), kind: 'collocation', badge: '选词填空 · Cloze', prompt: '选出最合适填入空格的词语。',
      sentence: item.sentence.replace(item.word, '＿＿'), word: item.word, meaning: item.meaning,
      opts: shuffle([item, ...distract]).map(o => ({ word: o.word, isC: o.word === item.word })) });
    setSqSel(null);
  }, [collocationPool, sentencePool, cards, wrong]);

  // 词语替换: a 2-char word in the sentence is replaced with a confusable (one-char swap). User picks the correct word.
  const newReplaceQ = useCallback(() => {
    const item = pickAdaptive(replacePool, cards, wrong) || replacePool[0];
    const synSet = synSetOf(item.word);
    // The wrong word and every distractor must be genuinely wrong, so exclude any
    // synonym of the answer from both roles.
    let candidates = shuffle(item.confusables.filter(cand => !(synSet && synSet.has(cand))));
    if (candidates.length === 0) candidates = shuffle(item.confusables.slice());
    const [a, b] = chs(item.word);
    let wrong = candidates[0], distractors = [], bestScore = -1;
    for (const cand of candidates) {
      const cs = chs(cand);
      if (cs.length !== 2) continue;
      const [c, d] = cs;
      const correctPos = (a === c) ? 0 : 1; // correct shares this char with wrong
      const usedHere = new Set([item.word, cand]);
      const at0 = w => { const x = chs(w); return x.length === 2 && x[0] === c && x[1] !== d && !usedHere.has(w) && !(synSet && synSet.has(w)); };
      const at1 = w => { const x = chs(w); return x.length === 2 && x[1] === d && x[0] !== c && !usedHere.has(w) && !(synSet && synSet.has(w)); };
      const buildSide = pos => {
        const f = pos === 0 ? at0 : at1;
        let pool = item.confusables.filter(x => x !== cand && f(x));
        const corp = pos === 0 ? startsWith(c, cand) : endsWith(d, cand);
        pool = [...pool, ...corp.filter(x => f(x) && !pool.includes(x))];
        pool = [...pool, ...EXTRA_WORDS.filter(x => f(x) && !pool.includes(x))];
        return shuffle(pool);
      };
      const samePool = buildSide(correctPos);
      const otherPool = buildSide(correctPos === 0 ? 1 : 0);
      const balanced = samePool.length >= 1 && otherPool.length >= 2; // can do 1 (+correct) on one side, 2 on the other
      const same1 = samePool.slice(0, 1); // 1 from same side
      const other2 = otherPool.slice(0, 2); // 2 from other side
      let result = [...same1, ...other2];
      if (result.length < 3) {
        // shortage: fill from spare on either side
        const spare = [...samePool.slice(same1.length), ...otherPool.slice(other2.length)];
        while (result.length < 3 && spare.length) result.push(spare.shift());
      }
      const score = (balanced ? 100 : 0) + result.length; // prefer a balanced 2+2 layout
      if (score > bestScore) { bestScore = score; wrong = cand; distractors = result.slice(0, 3); }
      if (balanced && result.length >= 3) break; // ideal — stop early
    }
    const idx = item.sentence.indexOf(item.word);
    const sentenceParts = { before: item.sentence.slice(0, idx), wrong, after: item.sentence.slice(idx + item.word.length) };
    const optWords = [item.word, ...distractors];
    setSq({ qid: Date.now(), kind: 'replace', badge: '词语替换 · One-character swap', prompt: '句中划线的词语用错了 —— 应改成：',
      sub: item.meaning ? `意思：${item.meaning}` : '',
      sentenceParts, word: item.word, wrong, meaning: item.meaning,
      opts: shuffle(optWords).map(w => ({ word: w, isC: w === item.word })) });
    setSqSel(null);
  }, [replacePool, cards, wrong]);

  const qBtn = { display:'block', width:'100%', textAlign:'left', padding:'10px 13px', margin:'5px 0', border:'1px solid #E8E8E4', borderRadius:9, background:'transparent', cursor:'pointer', fontSize:13, color:'#1A1A18', boxSizing:'border-box', outline:'none', appearance:'none', WebkitAppearance:'none', WebkitTapHighlightColor:'transparent' };
  const optCss = `button.vc-qopt:focus,button.vc-qopt:focus-visible,button.vc-qopt:active{outline:none!important;box-shadow:none!important;}`;

  if (mode === 'menu') return (
    <div>
      {score.t > 0 && <div style={{ background:'#FAFAF8', border:'1px solid #E8E8E4', borderRadius:9, padding:'9px 13px', marginBottom:12, fontSize:12, color:'#888', textAlign:'center' }}>{score.c}/{score.t} correct ({Math.round(score.c / score.t * 100)}%)</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { id:'meaning', icon:'🃏', title:'Idioms Meaning Quiz', sub:'Match idioms to meanings', action: () => { setMode('meaning'); newMQ(); } },
          { id:'exam', icon:'📝', title:'Idioms Sentence Quiz', sub:'Real sentences with gaps', action: () => { setMode('sentence'); newExamQ(); } },
          { id:'collocation', icon:'🔗', title:'选词填空', sub:'Pick the word that fits', action: () => { setMode('sentence'); newCollocationQ(); } },
          { id:'replace', icon:'🔁', title:'词语替换', sub:'Spot the one-character difference', action: () => { setMode('sentence'); newReplaceQ(); } },
        ].map(({ id, icon, title, sub, action }) => (
          <Card key={id} style={{ cursor:'pointer', textAlign:'center' }} onClick={action}>
            <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
            <div style={{ fontWeight:600, marginBottom:3, fontSize:13 }}>{title}</div>
            <div style={{ fontSize:11, color:'#888' }}>{sub}</div>
          </Card>
        ))}
      </div>
    </div>
  );

  const BackBtn = () => <Chip onClick={() => setMode('menu')}>← Back</Chip>;
  const ScoreTag = () => <span style={{ fontSize:11, color:'#AAA' }}>{score.c}/{score.t} correct</span>;
  const NextBtn = ({ onClick }) => <button onClick={onClick} style={{ fontSize:13, padding:'8px 22px', border:'1px solid #E0E0DC', borderRadius:8, background:'#FAFAF8', cursor:'pointer', color:'#1A1A18', display:'block', margin:'12px auto 0' }}>Next →</button>;

  if (mode === 'meaning' && q) return (
    <div>
      <style>{optCss}</style>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, alignItems:'center' }}><BackBtn /><ScoreTag /></div>
      <Card>
        <p style={{ fontSize:14, fontWeight:600, marginBottom:14, color:'#1A1A18' }}>{q.prompt}</p>
        {q.opts.map((opt, i) => {
          const sty = sel === null ? {} : opt.isC ? { background:'#EAF3DE', borderColor:'#97C459', color:'#3B6D11' } : sel === i ? { background:'#FCEBEB', borderColor:'#E24B4A', color:'#A32D2D' } : { opacity:0.5 };
          return <button key={(q.qid||0)+":"+i} className="vc-qopt" style={{ ...qBtn, ...sty }} onMouseDown={e => e.preventDefault()} onClick={e => { if (sel !== null) return; e.currentTarget.blur(); setSel(i); onAnswer(); if (!opt.isC && q.word && onWrong) onWrong(q.word, 'meaning', opt.word); setScore(s => ({ c: s.c + (opt.isC ? 1 : 0), t: s.t + 1 })); }}>{opt.label}{opt.sub && <span style={{ fontSize:11, opacity:0.6, marginLeft:5 }}>{opt.sub}</span>}</button>;
        })}
        {sel !== null && <NextBtn onClick={newMQ} />}
      </Card>
    </div>
  );

  if (mode === 'sentence') {
    if (!sq) return (
      <div>
        <div style={{ marginBottom:12 }}><BackBtn /></div>
        <Card style={{ textAlign:'center', padding:'40px 20px' }}>
          <p style={{ fontSize:13, color:'#888', lineHeight:1.6 }}>Not enough words with example sentences yet for this quiz.<br />Run <code>npm run gen-words</code> to unlock the full question pool.</p>
        </Card>
      </div>
    );
    const next = sq.kind === 'exam' ? newExamQ : sq.kind === 'collocation' ? newCollocationQ : newReplaceQ;
    return (
      <div>
        <style>{optCss}</style>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, alignItems:'center' }}><BackBtn /><ScoreTag /></div>
        <Card>
          <Badge type="关联词" style={{ marginBottom:9, display:'inline-block' }}>{sq.badge}</Badge>
          <p style={{ fontSize:16, fontWeight:600, color:'#1A1A18', margin:'6px 0 4px', lineHeight:1.8, fontFamily:'serif' }}>
            {sq.sentenceParts
              ? <>{sq.sentenceParts.before}<span style={{ textDecoration:'underline wavy #E24B4A', textDecorationSkipInk:'none', textUnderlineOffset:'4px', color:'#A32D2D' }}>{sq.sentenceParts.wrong}</span>{sq.sentenceParts.after}</>
              : sq.sentence}
          </p>
          <p style={{ fontSize:11, color:'#888', marginBottom: sq.sub ? 3 : 12 }}>{sq.prompt}</p>
          {sq.sub && <p style={{ fontSize:11, color:'#C9956A', marginBottom:12 }}>{sq.sub}</p>}
          {sq.opts.map((opt, i) => {
            const sty = sqSel !== null ? (opt.isC ? { background:'#EAF3DE', borderColor:'#97C459', color:'#3B6D11' } : sqSel === i ? { background:'#FCEBEB', borderColor:'#E24B4A', color:'#A32D2D' } : { opacity:0.5 }) : {};
            return <button key={(sq.qid||0)+":"+i} className="vc-qopt" style={{ ...qBtn, ...sty }} onMouseDown={e => e.preventDefault()} onClick={e => { if (sqSel !== null) return; e.currentTarget.blur(); setSqSel(i); onAnswer(); if (!opt.isC && sq.word && onWrong) onWrong(sq.word, sq.kind || 'sentence', opt.word); setScore(s => ({ c: s.c + (opt.isC ? 1 : 0), t: s.t + 1 })); }}><span style={{ fontFamily:'serif', fontSize:16 }}>{opt.word}</span></button>;
          })}
          {sqSel !== null && (
            <>
              <div style={{ background:'#FAFAF8', borderRadius:8, padding:'8px 11px', marginTop:10, border:'1px solid #F0F0EC' }}>
                <p style={{ fontSize:12, fontWeight:600, color: sq.opts[sqSel]?.isC ? '#3B6D11' : '#A32D2D' }}>{sq.kind === 'replace' && sq.wrong ? (sq.opts[sqSel]?.isC ? `✓ 正确！「${sq.wrong}」应改为「${sq.word}」` : `✗ 应改为「${sq.word}」（句中「${sq.wrong}」用错了）`) : (sq.opts[sqSel]?.isC ? `✓ 正确！「${sq.word}」` : `✗ 答案是「${sq.word}」`)}{sq.meaning ? ` — ${sq.meaning}` : ''}</p>
              </div>
              <NextBtn onClick={next} />
            </>
          )}
        </Card>
      </div>
    );
  }

  return null;
}

// ─── EXAM WORDS ───────────────────────────────────────────────────────────────
function ExamWords({ onOpenWord }) {
  const [search, setSearch] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [yearF, setYearF] = useState('all');
  const [freqOnly, setFreqOnly] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE = 48;
  const years = useMemo(() => ['all', ...Array.from({ length: 13 }, (_, i) => String(2014 + i))], []);
  const filtered = useMemo(() => EXAM_WORDS.filter(w => {
    if (search && !w.w.includes(search)) return false;
    if (typeF !== 'all' && w.t !== typeF) return false;
    if (yearF !== 'all' && !w.y.includes(yearF)) return false;
    if (freqOnly && w.y.length < 2) return false;
    return true;
  }), [search, typeF, yearF, freqOnly]);
  useEffect(() => setPage(0), [search, typeF, yearF, freqOnly]);
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const totalPages = Math.ceil(filtered.length / PAGE);

  return (
    <div>
      <div style={{ background:'#FFFBF5', border:'1px solid #F5DEC8', borderRadius:9, padding:'9px 13px', marginBottom:12, fontSize:12, color:'#8A5E00' }}>
        {EXAM_WORDS.length} words from O-level Chinese papers, 2014–2026. Tap any word for meaning, sentence, 词语搭配 &amp; 构词.
      </div>
      <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:9, border:'1px solid #E0E0DC', fontSize:13, marginBottom:9, background:'white', outline:'none', boxSizing:'border-box' }} />
      <div style={{ display:'flex', gap:5, marginBottom:7, flexWrap:'wrap' }}>
        {['all','成语','关联词','叠字','普通词'].map(t => <Chip key={t} active={typeF === t} onClick={() => setTypeF(t)}>{t === 'all' ? 'All types' : t}</Chip>)}
        <Chip active={freqOnly} onClick={() => setFreqOnly(v => !v)}>⭐ 2×+ only</Chip>
      </div>
      <div style={{ display:'flex', gap:5, marginBottom:10, flexWrap:'wrap' }}>
        {years.map(y => <Chip key={y} active={yearF === y} onClick={() => setYearF(y)}>{y === 'all' ? 'All years' : y}</Chip>)}
      </div>
      <p style={{ fontSize:11, color:'#AAA', marginBottom:9 }}>{filtered.length} words shown</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:7 }}>
        {paged.map((w, i) => {
          const col = TC[w.t] || { bg:'#EEE', text:'#444' };
          return (
            <div key={i} onClick={() => onOpenWord(w.w)} style={{ background:'white', border:'1px solid #E8E8E4', borderRadius:10, padding:'10px 11px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:3 }}>
                <span style={{ fontSize:16, fontFamily:'serif', color:'#1A1A18', lineHeight:1.2 }}>{w.w}</span>
                <span style={{ fontSize:10, padding:'2px 4px', borderRadius:20, fontWeight:600, background:col.bg, color:col.text, marginLeft:3, whiteSpace:'nowrap' }}>{w.t}</span>
              </div>
              <div style={{ display:'flex', gap:2, flexWrap:'wrap' }}>
                {[...new Set(w.y)].map(yr => <span key={yr} style={{ fontSize:10, padding:'1px 4px', borderRadius:10, background:'#F5F5F2', color:'#888' }}>{yr}</span>)}
              </div>
              {w.y.length >= 2 && <div style={{ fontSize:11, color:A, marginTop:2 }}>{'●'.repeat(w.y.length)} {w.y.length}×</div>}
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14, alignItems:'center' }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding:'5px 12px', border:'1px solid #E0E0DC', borderRadius:7, background:'transparent', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontSize:12 }}>←</button>
          <span style={{ fontSize:12, color:'#888' }}>{page + 1} / {totalPages}</span>
          <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding:'5px 12px', border:'1px solid #E0E0DC', borderRadius:7, background:'transparent', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page === totalPages - 1 ? 0.4 : 1, fontSize:12 }}>→</button>
        </div>
      )}
    </div>
  );
}

// ─── SYLLABUS ─────────────────────────────────────────────────────────────────
function SyllabusView({ onOpenWord }) {
  const [search, setSearch] = useState('');
  const [secF, setSecF] = useState('all');
  const [page, setPage] = useState(0);
  const PAGE = 64;
  const examSet = useMemo(() => new Set(EXAM_WORDS.map(w => w.w)), []);
  const filtered = useMemo(() => SYLLABUS_WORDS.filter(w => {
    if (search && !w.w.includes(search) && !w.py.toLowerCase().includes(search.toLowerCase())) return false;
    if (secF !== 'all' && w.s !== secF) return false;
    return true;
  }), [search, secF]);
  useEffect(() => setPage(0), [search, secF]);
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const totalPages = Math.ceil(filtered.length / PAGE);

  return (
    <div>
      <div style={{ background:'#F0F7FF', border:'1px solid #C5DEF5', borderRadius:9, padding:'9px 13px', marginBottom:12, fontSize:12, color:'#185FA5' }}>
        {SYLLABUS_WORDS.length} words from the Sec 1–4 syllabus. Tap any word for full detail · orange dot = also in past exams.
      </div>
      <input placeholder="Search by character or pinyin…" value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', padding:'8px 12px', borderRadius:9, border:'1px solid #E0E0DC', fontSize:13, marginBottom:9, background:'white', outline:'none', boxSizing:'border-box' }} />
      <div style={{ display:'flex', gap:5, marginBottom:10, flexWrap:'wrap' }}>
        {[['all',`All (${SYLLABUS_WORDS.length})`],['1','Sec 1'],['2','Sec 2'],['3','Sec 3'],['4','Sec 4']].map(([v, label]) => (
          <Chip key={v} active={secF === v} onClick={() => setSecF(v)}>{label}</Chip>
        ))}
      </div>
      <p style={{ fontSize:11, color:'#AAA', marginBottom:9 }}>{filtered.length} words shown</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(125px,1fr))', gap:7 }}>
        {paged.map((w, i) => {
          const inExam = examSet.has(w.w);
          return (
            <div key={i} onClick={() => onOpenWord(w.w)} style={{ background:'white', border:`1px solid ${inExam ? '#F5DEC8' : '#E8E8E4'}`, borderRadius:10, padding:'10px 11px', position:'relative', cursor:'pointer' }}>
              {inExam && <div style={{ position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:A }} />}
              <div style={{ fontSize:16, fontFamily:'serif', color: inExam ? A : '#1A1A18', marginBottom:2, lineHeight:1.2 }}>{w.w}</div>
              {w.py && <div style={{ fontSize:11, color:'#AAA' }}>{w.py}</div>}
              <div style={{ fontSize:10, color:'#CCC', marginTop:2 }}>Sec {w.s}</div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14, alignItems:'center' }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding:'5px 12px', border:'1px solid #E0E0DC', borderRadius:7, background:'transparent', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontSize:12 }}>←</button>
          <span style={{ fontSize:12, color:'#888' }}>{page + 1} / {totalPages}</span>
          <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding:'5px 12px', border:'1px solid #E0E0DC', borderRadius:7, background:'transparent', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page === totalPages - 1 ? 0.4 : 1, fontSize:12 }}>→</button>
        </div>
      )}
    </div>
  );
}

// ─── CHARACTERS ───────────────────────────────────────────────────────────────
function Chars({ onOpenWord }) {
  const [mode, setMode] = useState('first');
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const all = mode === 'first' ? CHAR_F : CHAR_L;
  const query = q.trim();
  const groups = query ? all.filter(g => g.char.includes(query) || g.words.some(w => w.includes(query))) : all;
  return (
    <div>
      <div style={{ background:'#FAFAF8', border:'1px solid #E8E8E4', borderRadius:9, padding:'9px 13px', marginBottom:12, fontSize:12, color:'#888', lineHeight:1.6 }}>
        Past-exam words grouped by shared character (largest groups first). Tap a group to expand, then tap a word for its meaning, sentence &amp; 构词.
      </div>
      <div style={{ display:'flex', gap:7, marginBottom:9 }}>
        <Chip active={mode === 'first'} onClick={() => { setMode('first'); setOpen(null); }}>Same first character</Chip>
        <Chip active={mode === 'last'} onClick={() => { setMode('last'); setOpen(null); }}>Same last character</Chip>
      </div>
      <input placeholder="Search a character or word…" value={q} onChange={e => { setQ(e.target.value); setOpen(null); }} style={{ width:'100%', padding:'8px 12px', borderRadius:9, border:'1px solid #E0E0DC', fontSize:13, marginBottom:9, background:'white', outline:'none', boxSizing:'border-box' }} />
      <p style={{ fontSize:11, color:'#AAA', marginBottom:9 }}>{groups.length} groups</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:8 }}>
        {groups.map((g) => (
          <Card key={g.char} style={{ padding:'11px 13px', border: open === g.char ? `2px solid ${A}` : '1px solid #E8E8E4' }}>
            <div onClick={() => setOpen(open === g.char ? null : g.char)} style={{ cursor:'pointer' }}>
              <div style={{ fontSize:24, fontFamily:'serif', color:A, marginBottom:3 }}>{mode === 'first' ? `${g.char}＿` : `＿${g.char}`}</div>
              <div style={{ fontSize:11, color:'#AAA', marginBottom:5 }}>{g.words.length} words</div>
            </div>
            {open === g.char
              ? <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{g.words.map((w, j) => <button key={j} onClick={() => onOpenWord(w)} style={{ fontSize:11, fontFamily:'serif', background:'#F5F5F2', padding:'2px 7px', borderRadius:20, color:'#1A1A18', border:'1px solid #ECECE7', cursor:'pointer', outline:'none' }}>{w}</button>)}</div>
              : <div onClick={() => setOpen(g.char)} style={{ fontSize:11, color:'#888', cursor:'pointer' }}>{g.words.slice(0, 3).join('、')}…</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── MORE ─────────────────────────────────────────────────────────────────────
function More({ cards, onReset }) {
  const today = todayStr();
  const learned = STUDY_ITEMS.filter(i => cards[i.word] && cards[i.word].reps > 0);
  const due = STUDY_ITEMS.filter(i => { const c = cards[i.word]; return c && c.nextReview <= today; });
  const pct = Math.round(learned.length / STUDY_ITEMS.length * 100);
  const [done, setDone] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const doExport = () => {
    const lines = ['CHINESE VOCAB — REVISION LIST', `Generated: ${new Date().toLocaleDateString()}`, '', `Progress: ${learned.length}/${STUDY_ITEMS.length} words · ${due.length} due today`, '', '=== DUE TODAY ==='];
    if (!due.length) lines.push('Nothing due — all caught up!');
    due.forEach(w => { const c = cards[w.word]; lines.push('', `${w.word} (${w.pinyin}) — ${c.reps} reviews`, `Meaning: ${w.meaning}`, `Example: ${w.cn}`, `         ${w.en}`); });
    lines.push('', '', `=== LEARNED (${learned.length}) ===`);
    learned.forEach(w => lines.push(`${w.word} (${w.pinyin}) — ${w.meaning}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vocab_revision.txt'; a.click(); URL.revokeObjectURL(url);
    setDone(true); setTimeout(() => setDone(false), 2500);
  };

  return (
    <div>
      <Card style={{ marginBottom:11 }}>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:7, color:'#1A1A18' }}>Your Progress</p>
        <div style={{ height:5, background:'#F0F0EC', borderRadius:3, overflow:'hidden', marginBottom:7 }}>
          <div style={{ height:'100%', width:`${pct}%`, background:A, borderRadius:3 }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888' }}>
          <span>{learned.length}/103 idioms ({pct}%)</span>
          <span>{due.length} due today</span>
        </div>
        {due.length > 0 && (
          <div style={{ marginTop:9, display:'flex', flexWrap:'wrap', gap:4 }}>
            {due.map((w, i) => <span key={i} style={{ fontSize:12, fontFamily:'serif', background:'#FCEBEB', color:'#A32D2D', padding:'2px 7px', borderRadius:20 }}>{w.word}</span>)}
          </div>
        )}
      </Card>
      <Card style={{ marginBottom:11 }}>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:5, color:'#1A1A18' }}>Export Revision Sheet</p>
        <p style={{ fontSize:12, color:'#888', marginBottom:11 }}>Download a printable .txt of your due idioms and all 103 definitions.</p>
        <button onClick={doExport} style={{ padding:'8px 18px', border:'1px solid #E0E0DC', borderRadius:9, background:'transparent', cursor:'pointer', color:'#1A1A18', fontSize:13 }}>
          {done ? '✓ Downloaded!' : 'Download revision sheet'}
        </button>
      </Card>
      <Card>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:5, color:'#1A1A18' }}>About</p>
        <p style={{ fontSize:12, color:'#888', lineHeight:1.7 }}>
          <strong>103</strong> common idioms with SM-2 spaced repetition · <strong>{EXAM_WORDS.length}</strong> past exam words (2014–2026) · <strong>{SYLLABUS_WORDS.length}</strong> syllabus words (Sec 1–4). Every word opens a detail card with meaning, example sentence, 词语搭配 and 构词. Quizzes cover idioms meaning, idioms sentence, 选词填空 and 词语替换.
          <br /><br />Progress saves automatically to this browser.
        </p>
      </Card>
      <Card style={{ marginTop:11, border:'1px solid #F3D2D2' }}>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:5, color:'#A32D2D' }}>Reset Progress</p>
        <p style={{ fontSize:12, color:'#888', marginBottom:11, lineHeight:1.6 }}>Permanently delete all saved data on this device — review history, streak, and today's count. This cannot be undone.</p>
        {!resetConfirm ? (
          <button onClick={() => setResetConfirm(true)} style={{ padding:'8px 18px', border:'1px solid #E24B4A', borderRadius:9, background:'transparent', cursor:'pointer', color:'#A32D2D', fontSize:13, outline:'none' }}>Reset all progress</button>
        ) : (
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'#A32D2D', fontWeight:600 }}>Delete everything?</span>
            <button onClick={() => { onReset(); setResetConfirm(false); }} style={{ padding:'8px 16px', border:'none', borderRadius:9, background:'#E24B4A', cursor:'pointer', color:'white', fontSize:13, outline:'none' }}>Yes, delete</button>
            <button onClick={() => setResetConfirm(false)} style={{ padding:'8px 16px', border:'1px solid #E0E0DC', borderRadius:9, background:'transparent', cursor:'pointer', color:'#1A1A18', fontSize:13, outline:'none' }}>Cancel</button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── WORD DETAIL (shared card: meaning · sentence · 词语搭配 · 构词) ──────────────
function IdiomBank({ cards, onRate, onAnswer, onOpenWord }) {
  const [view, setView] = useState('browse');
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('core');
  const today = todayStr();

  const list = useMemo(() => {
    const cjk = w => [...w].filter(c => /[\u4e00-\u9fff]/.test(c)).length;
    const base = scope === 'core' ? IDIOMS.map(i => i.word) : Object.keys(WORD_DATA).filter(w => cjk(w) >= 4);
    const q = search.trim().toLowerCase();
    return base.filter(w => {
      if (!q) return true;
      const info = wordInfo(w) || {};
      return w.includes(q) || (pinyinOf(w) || '').toLowerCase().includes(q) ||
        (info.meaning || '').includes(search.trim()) || (info.en || '').toLowerCase().includes(q);
    }).sort((a, b) => a.localeCompare(b, 'zh'));
  }, [search, scope]);

  const allCount = useMemo(() => Object.keys(WORD_DATA).filter(w => [...w].filter(c => /[\u4e00-\u9fff]/.test(c)).length >= 4).length, []);

  if (view === 'cards') return (
    <div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 11 }}>
        <Chip active={false} onClick={() => setView('browse')}>📚 词库 Browse</Chip>
        <Chip active>🃏 闪卡 Flashcards</Chip>
      </div>
      <Review cards={cards} onRate={onRate} onAnswer={onAnswer} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 11 }}>
        <Chip active>📚 词库 Browse</Chip>
        <Chip active={false} onClick={() => setView('cards')}>🃏 闪卡 Flashcards</Chip>
      </div>

      <input placeholder="搜索成语、拼音或意思… Search…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 9, border: '1px solid #E0E0DC', fontSize: 13, marginBottom: 9, background: 'white', outline: 'none', boxSizing: 'border-box' }} />

      <div style={{ display: 'flex', gap: 5, marginBottom: 11, flexWrap: 'wrap' }}>
        <Chip active={scope === 'core'} onClick={() => setScope('core')}>常用 {IDIOMS.length}</Chip>
        <Chip active={scope === 'all'} onClick={() => setScope('all')}>全部成语 {allCount}</Chip>
      </div>

      <p style={{ fontSize: 11, color: '#AAA', marginBottom: 9 }}>{list.length} 个成语 · 点击查看释义、例句与构词</p>

      {list.map(w => {
        const info = wordInfo(w) || {};
        const c = cards[w];
        const isNew = !c, isDue = c && c.nextReview <= today;
        return (
          <div key={w} onClick={() => onOpenWord(w)}
            style={{ borderBottom: '1px solid #F0F0EC', padding: '11px 2px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'serif', fontSize: 20, color: '#1A1A18' }}>{w}</span>
                <span style={{ fontSize: 11, color: A }}>{info.py || pinyinOf(w)}</span>
                {isDue && <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', padding: '2px 6px', borderRadius: 9 }}>Due</span>}
                {isNew && <span style={{ fontSize: 10, background: '#F0F4E8', color: '#4F6B22', padding: '2px 6px', borderRadius: 9 }}>New</span>}
              </div>
              {info.meaning && <div style={{ fontSize: 12.5, color: '#666', marginTop: 4, lineHeight: 1.6 }}>{info.meaning}</div>}
              {info.en && <div style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>{info.en}</div>}
            </div>
            <span style={{ color: '#DDD', fontSize: 15, paddingTop: 4 }}>›</span>
          </div>
        );
      })}
      {!list.length && <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '30px 0' }}>没有找到相关成语。</p>}
    </div>
  );
}

function WrongBank({ wrong, onOpenWord, onRemove, onClear }) {
  const rows = useMemo(() => Object.entries(wrong)
    .map(([w, e]) => {
      const picks = Object.entries(e.picks || {}).sort((a, b) => b[1] - a[1]);
      return { w, n: e.n || 0, last: e.last, first: e.first, modes: e.modes || {}, topPick: picks[0] || null, picks };
    })
    .sort((a, b) => b.n - a.n || (b.last > a.last ? 1 : -1)), [wrong]);

  const MODE_CN = { meaning: '词义', exam: '成语填空', collocation: '选词填空', replace: '词语替换', sentence: '句子' };

  const sheetText = () => rows.map((r, i) => {
    const info = wordInfo(r.w) || {};
    const L = [`${i + 1}. ${r.w}  ${info.py || pinyinOf(r.w) || ''}   （错 ${r.n} 次）`];
    if (info.meaning) L.push(`   释义：${info.meaning}`);
    if (info.sentence) L.push(`   例句：${info.sentence.split(r.w).join('＿＿')}`);
    if (r.topPick) L.push(`   常错选：${r.topPick[0]}（${r.topPick[1]} 次）`);
    return L.join('\n');
  }).join('\n\n');

  const copyAll = async () => {
    const t = `错题本 · Wrong-Answer Revision Sheet\n共 ${rows.length} 个词语\n\n${sheetText()}`;
    try { await navigator.clipboard.writeText(t); alert('已复制到剪贴板 Copied to clipboard'); }
    catch (e) { alert('复制失败，请手动选取。Copy failed — please select manually.'); }
  };

  const downloadCsv = () => {
    const esc = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const head = ['词语', '拼音', '释义', '英文', '例句', '错误次数', '常错选项', '题型', '最近错误'];
    const lines = [head.map(esc).join(',')];
    for (const r of rows) {
      const info = wordInfo(r.w) || {};
      lines.push([r.w, info.py || pinyinOf(r.w) || '', info.meaning || '', info.en || '', info.sentence || '',
        r.n, r.picks.map(p => `${p[0]}×${p[1]}`).join(' '),
        Object.keys(r.modes).map(m => MODE_CN[m] || m).join(' '), r.last || ''].map(esc).join(','));
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `错题本-${todayStr()}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printCss = `@media print{
    body *{visibility:hidden!important}
    #vc-sheet,#vc-sheet *{visibility:visible!important}
    #vc-sheet{position:absolute!important;left:0;top:0;width:100%;padding:0!important;margin:0!important}
    .vc-noprint{display:none!important}
    .vc-sheet-row{break-inside:avoid;page-break-inside:avoid}
    @page{margin:16mm}
  }`;

  if (!rows.length) return (
    <Card style={{ textAlign: 'center', padding: '44px 20px' }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
      <p style={{ fontWeight: 600, fontSize: 15, color: '#1A1A18', marginBottom: 6 }}>错题本是空的</p>
      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>做测验时答错的词语会自动收进这里，<br />方便日后复习。</p>
      <p style={{ fontSize: 11, color: '#BBB', marginTop: 10 }}>Words you get wrong in the quiz collect here automatically.</p>
    </Card>
  );

  const btn = { fontSize: 12, padding: '7px 12px', border: '1px solid #E0E0DC', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#1A1A18' };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className="vc-noprint" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button style={{ ...btn, background: A, color: 'white', borderColor: A }} onClick={() => window.print()}>🖨 打印 Print</button>
        <button style={btn} onClick={copyAll}>📋 复制 Copy</button>
        <button style={btn} onClick={downloadCsv}>⬇ CSV</button>
        <button style={{ ...btn, marginLeft: 'auto', color: '#A32D2D', borderColor: '#F0D6D6' }}
          onClick={() => { if (confirm(`清空错题本？将移除 ${rows.length} 个词语。`)) onClear(); }}>清空 Clear</button>
      </div>

      <div id="vc-sheet">
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18' }}>错题本 · Revision Sheet</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>{rows.length} 个词语 · {todayStr()}</div>
        </div>

        {rows.map((r, i) => {
          const info = wordInfo(r.w) || {};
          const py = info.py || pinyinOf(r.w) || '';
          return (
            <div key={r.w} className="vc-sheet-row" style={{ borderBottom: '1px solid #F0F0EC', padding: '11px 0', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 11, color: '#CCC', width: 18, paddingTop: 5, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span onClick={() => onOpenWord(r.w)} style={{ fontFamily: 'serif', fontSize: 21, color: '#1A1A18', cursor: 'pointer' }}>{r.w}</span>
                  {py && <span style={{ fontSize: 11, color: A }}>{py}</span>}
                  <span style={{ fontSize: 11, background: '#FCEBEB', color: '#A32D2D', padding: '2px 7px', borderRadius: 10 }}>错 {r.n} 次</span>
                </div>
                {info.meaning && <div style={{ fontSize: 12.5, color: '#555', marginTop: 4, lineHeight: 1.6 }}>{info.meaning}</div>}
                {info.sentence && <div style={{ fontSize: 12.5, color: '#1A1A18', marginTop: 5, lineHeight: 1.7, background: '#FAFAF8', padding: '7px 10px', borderRadius: 7 }}>{info.sentence.split(r.w).join('＿＿')}</div>}
                {r.topPick && <div style={{ fontSize: 11, color: '#B0703C', marginTop: 5 }}>常错选：<span style={{ fontFamily: 'serif', fontSize: 13 }}>{r.topPick[0]}</span>（{r.topPick[1]} 次）</div>}
                <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                  {Object.entries(r.modes).map(([m, c]) => (
                    <span key={m} style={{ fontSize: 11, color: '#999', background: '#F5F5F2', padding: '2px 7px', borderRadius: 9 }}>{MODE_CN[m] || m} ×{c}</span>
                  ))}
                </div>
              </div>
              <button className="vc-noprint" onClick={() => onRemove(r.w)}
                style={{ fontSize: 11, color: '#BBB', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px', flexShrink: 0 }}>移除</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WordDetail({ word, onOpenWord }) {
  const info = wordInfo(word);
  const idiom = IDIOMS.find(i => i.word === word);
  const py = pinyinOf(word);
  const gouci = buildGouci(word);
  const meaning = info?.meaning || idiom?.meaning;
  const en = info?.en || idiom?.en;
  const sentence = info?.sentence || idiom?.cn;
  const sentenceEn = info?.sentenceEn || (idiom ? idiom.en : '');
  const collocations = (info?.collocations || []).filter(c => c !== word);
  const sentence2 = idiom && idiom.cn && idiom.cn !== sentence ? idiom.cn : null;
  const sentence2En = sentence2 ? idiom.en : '';

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 15 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 0.4, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
  const GBlock = ({ label, words }) => words.length ? (
    <div style={{ marginBottom: 9 }}>
      <div style={{ fontSize: 11, color: '#AAA', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {words.map((w, i) => (
          <button key={i} onClick={() => onOpenWord(w)} style={{ fontSize: 13, fontFamily: 'serif', background: '#F5F5F2', padding: '3px 9px', borderRadius: 20, color: '#1A1A18', border: '1px solid #ECECE7', cursor: 'pointer' }}>{w}</button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ fontSize: 40, fontFamily: 'serif', color: '#1A1A18', lineHeight: 1.1 }}>{word}</div>
          <SpeakBtn text={word} size={20} />
        </div>
        {py && <div style={{ fontSize: 14, color: A, marginTop: 3 }}>{py}</div>}
      </div>

      {meaning ? (
        <>
          <Section title="意思 · MEANING">
            <p style={{ fontSize: 14, color: '#1A1A18', lineHeight: 1.6 }}>{meaning}</p>
            {en && <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{en}</p>}
          </Section>
          {sentence && (
            <Section title="例句 · SENTENCE">
              <div style={{ background: '#FAFAF8', borderRadius: 8, padding: '10px 12px', border: '1px solid #F0F0EC' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:2 }}>
                  <p style={{ fontSize: 14, color: '#1A1A18', lineHeight: 1.7, flex:1 }}>{sentence}</p>
                  <SpeakBtn text={sentence} size={13} />
                </div>
                {sentenceEn && <p style={{ fontSize: 11, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{sentenceEn}</p>}
              </div>
              {sentence2 && (
                <div style={{ background: '#FAFAF8', borderRadius: 8, padding: '10px 12px', border: '1px solid #F0F0EC', marginTop: 7 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:2 }}>
                    <p style={{ fontSize: 14, color: '#1A1A18', lineHeight: 1.7, flex:1 }}>{sentence2}</p>
                    <SpeakBtn text={sentence2} size={13} />
                  </div>
                  {sentence2En && <p style={{ fontSize: 11, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{sentence2En}</p>}
                </div>
              )}
            </Section>
          )}
          {collocations.length > 0 && (
            <Section title="词语搭配 · COLLOCATIONS">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {collocations.map((c, i) => (
                  <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', fontFamily: 'serif', background: '#FAECE7', color: '#993C1D', padding: '5px 11px', borderRadius: 12 }}>
                    <span style={{ fontSize: 13 }}>{c}</span>
                    {COLLOC_EN[c] && <span style={{ fontSize: 11, fontFamily: 'system-ui, sans-serif', color: '#B07A66', marginTop: 1 }}>{COLLOC_EN[c]}</span>}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </>
      ) : (
        <div style={{ background: '#FFFBF5', border: '1px solid #F5DEC8', borderRadius: 9, padding: '11px 13px', marginBottom: 15, fontSize: 12, color: '#8A5E00', lineHeight: 1.6 }}>
          意思、例句和词语搭配尚未生成。Run <code>npm run gen-words</code> to fill this word in. The 构词 examples below are available now.
        </div>
      )}

      {gouci && (
        <Section title="构词 · WORD BUILDING">
          <GBlock label={`${gouci.a}＿（“${gouci.a}”在首）`} words={gouci.AX} />
          <GBlock label={`＿${gouci.a}（“${gouci.a}”在尾）`} words={gouci.XA} />
          <GBlock label={`${gouci.b}＿（“${gouci.b}”在首）`} words={gouci.BX} />
          <GBlock label={`＿${gouci.b}（“${gouci.b}”在尾）`} words={gouci.XB} />
          {!gouci.AX.length && !gouci.XA.length && !gouci.BX.length && !gouci.XB.length &&
            <p style={{ fontSize: 12, color: '#AAA' }}>No related words found in the current word set.</p>}
        </Section>
      )}
    </div>
  );
}

function WordModal({ stack, onClose, onOpenWord, onBack }) {
  if (!stack.length) return null;
  const word = stack[stack.length - 1];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,14,6,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: 560, maxHeight: '86vh', overflowY: 'auto', borderRadius: '18px 18px 0 0', padding: '14px 18px 30px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {stack.length > 1
            ? <button onClick={onBack} style={{ fontSize: 13, border: 'none', background: 'transparent', color: A, cursor: 'pointer', padding: 0 }}>← Back</button>
            : <span />}
          <button onClick={onClose} style={{ fontSize: 22, border: 'none', background: 'transparent', color: '#BBB', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <WordDetail word={word} onOpenWord={onOpenWord} />
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id:'home', icon:'🏠', label:'Home' },
  { id:'review', icon:'📖', label:'成语' },
  { id:'quiz', icon:'🎯', label:'Quiz' },
  { id:'wrong', icon:'📕', label:'错题本' },
  { id:'examwords', icon:'📋', label:'Exam' },
  { id:'syllabus', icon:'📚', label:'Syllabus' },
  { id:'chars', icon:'🔤', label:'Chars' },
  { id:'more', icon:'⚙️', label:'More' },
];
const TITLES = { home:'华文词汇练习', review:'成语 · Idioms', quiz:'Quiz', wrong:'错题本 · Wrong Answers', examwords:'Past Exam Words', syllabus:'Syllabus Words', chars:'Character Groups', more:'Progress & Export' };

export default function Home_Page() {
  const [tab, setTab] = useState('home');
  const [cards, setCards] = useState({});
  const [wrong, setWrong] = useState({});
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [wordStack, setWordStack] = useState([]);
  const openWord = useCallback(w => setWordStack(s => [...s, w]), []);
  const backWord = useCallback(() => setWordStack(s => s.slice(0, -1)), []);
  const closeWord = useCallback(() => setWordStack([]), []);
  const resetAll = useCallback(() => {
    try { localStorage.removeItem('vc-cards'); localStorage.removeItem('vc-streak'); localStorage.removeItem('vc-wrong'); } catch (e) {}
    setCards({}); setStreak(0); setTodayCount(0); setWrong({});
  }, []);

  const onWrong = useCallback((word, mode, picked) => setWrong(prev => {
    const e = prev[word] || { n: 0, modes: {}, picks: {}, first: todayStr(), last: todayStr() };
    return { ...prev, [word]: {
      n: e.n + 1,
      modes: { ...e.modes, [mode]: (e.modes[mode] || 0) + 1 },
      picks: picked ? { ...e.picks, [picked]: (e.picks[picked] || 0) + 1 } : e.picks,
      first: e.first || todayStr(),
      last: todayStr(),
    } };
  }), []);
  const onQuizMiss = useCallback((word, mode, picked) => {
    onWrong(word, mode, picked);
    setCards(prev => ({ ...prev, [word]: applyRating(prev[word], 1) }));
  }, [onWrong]);
  const removeWrong = useCallback(word => setWrong(prev => { const n = { ...prev }; delete n[word]; return n; }), []);
  const clearWrong = useCallback(() => setWrong({}), []);

  useEffect(() => {
    const c = lLoad('vc-cards'), s = lLoad('vc-streak'), wg = lLoad('vc-wrong');
    if (c) setCards(c);
    if (wg) setWrong(wg);
    if (s) {
      const today = todayStr(), yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (s.d === today) { setStreak(s.s); setTodayCount(s.c || 0); }
      else if (s.d === yesterday) setStreak(s.s);
      else setStreak(0);
    }
    setMounted(true);
  }, []);

  useEffect(() => { if (mounted) lSave('vc-cards', cards); }, [cards, mounted]);
  useEffect(() => { if (mounted) lSave('vc-wrong', wrong); }, [wrong, mounted]);

  const onRate = useCallback((word, q) => setCards(prev => ({ ...prev, [word]: applyRating(prev[word], q) })), []);

  const onAnswer = useCallback(() => {
    setTodayCount(c => {
      const nc = c + 1;
      setStreak(s => {
        const ns = nc === 1 ? s + 1 : s;
        lSave('vc-streak', { d: todayStr(), s: ns, c: nc });
        return ns;
      });
      return nc;
    });
  }, []);

  if (!mounted) return <div style={{ textAlign:'center', padding:48, color:'#AAA' }}>Loading…</div>;

  return (
    <div style={{ maxWidth:720, margin:'0 auto', paddingBottom:72, minHeight:'100vh', background:'#FAFAF8' }}>
      <div style={{ padding:'14px 20px 11px', borderBottom:'1px solid #E8E8E4', marginBottom:16, background:'white', position:'sticky', top:0, zIndex:50 }}>
        <h1 style={{ fontSize:17, fontWeight:700, color:'#1A1A18', margin:0 }}>{TITLES[tab]}</h1>
        {tab === 'home' && <p style={{ fontSize:11, color:'#AAA', marginTop:2 }}>{IDIOMS.length} idioms · {EXAM_WORDS.length} exam words · {SYLLABUS_WORDS.length} syllabus words</p>}
      </div>

      <div style={{ padding:'0 20px' }}>
        {tab === 'home' && <Home cards={cards} streak={streak} todayCount={todayCount} setTab={setTab} wrongCount={Object.keys(wrong).length} />}
        {tab === 'review' && <IdiomBank cards={cards} onRate={onRate} onAnswer={onAnswer} onOpenWord={openWord} />}
        {tab === 'quiz' && <Quiz onAnswer={onAnswer} onWrong={onQuizMiss} cards={cards} wrong={wrong} />}
        {tab === 'wrong' && <WrongBank wrong={wrong} onOpenWord={openWord} onRemove={removeWrong} onClear={clearWrong} />}
        {tab === 'examwords' && <ExamWords onOpenWord={openWord} />}
        {tab === 'syllabus' && <SyllabusView onOpenWord={openWord} />}
        {tab === 'chars' && <Chars onOpenWord={openWord} />}
        {tab === 'more' && <More cards={cards} onReset={resetAll} />}
      </div>

      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:720, background:'white', borderTop:'1px solid #E8E8E4', display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom)' }}>
        {NAV.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex:'1 1 0', minWidth:0, padding:'8px 1px 10px', border:'none', background:'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <span style={{ fontSize:16, lineHeight:1 }}>{icon}</span>
            <span style={{ fontSize:9.5, whiteSpace:'nowrap', color: tab === id ? A : '#AAA', fontWeight: tab === id ? 700 : 400 }}>{label}</span>
            {tab === id && <div style={{ width:18, height:2, background:A, borderRadius:1 }} />}
          </button>
        ))}
      </div>

      <WordModal stack={wordStack} onOpenWord={openWord} onBack={backWord} onClose={closeWord} />
    </div>
  );
}
