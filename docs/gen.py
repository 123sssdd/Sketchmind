import random, math, cairosvg
random.seed(7)
INK="#142A49"; F="Noto Sans CJK SC"
B,G,Y,P,V="#EAF6FF","#EEF8E8","#FFF8D8","#FCEBF1","#F0EDFF"
W,H=2400,1560
o=[]
def j(a=2.2): return random.uniform(-a,a)
def line_path(pts):
    d="M%.1f %.1f"%(pts[0][0]+j(),pts[0][1]+j())
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        mx,my=(x0+x1)/2+j(3),(y0+y1)/2+j(3)
        d+=" Q%.1f %.1f %.1f %.1f"%(mx,my,x1+j(),y1+j())
    return d
def box(x,y,w,h,fill,sw=3,r=18,dash=None):
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="none"/>')
    pts=[(x+r,y),(x+w-r,y),(x+w,y+r),(x+w,y+h-r),(x+w-r,y+h),(x+r,y+h),(x,y+h-r),(x,y+r),(x+r,y)]
    da=f' stroke-dasharray="{dash}"' if dash else ''
    for k in range(2):
        o.append(f'<path d="{line_path(pts)}" fill="none" stroke="{INK}" stroke-width="{sw if k==0 else sw*0.5}" stroke-linecap="round" stroke-linejoin="round" opacity="{1 if k==0 else .55}"{da}/>')
def text(x,y,s,size=26,weight=400,anchor="middle",color=INK):
    s=s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    o.append(f'<text x="{x}" y="{y}" font-family="{F}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{color}">{s}</text>')
def lines(x,y,arr,size=24,gap=1.45,**k):
    for i,s in enumerate(arr): text(x,y+i*size*gap,s,size,**k)
def hl(x,y,w,h,c="#FFE27A"):
    o.append(f'<path d="M{x} {y+h*.2} L{x+w} {y} L{x+w+4} {y+h} L{x-3} {y+h*1.05}Z" fill="{c}" opacity=".7"/>')
def arrow(pts,label=None,lx=None,ly=None,dash=None,sw=3.2):
    da=f' stroke-dasharray="{dash}"' if dash else ''
    o.append(f'<path d="{line_path(pts)}" fill="none" stroke="{INK}" stroke-width="{sw}" stroke-linecap="round"{da}/>')
    (x0,y0),(x1,y1)=pts[-2],pts[-1]; a=math.atan2(y1-y0,x1-x0); L=20
    for s in(-1,1):
        o.append(f'<path d="M{x1} {y1} L{x1-L*math.cos(a+s*.45):.1f} {y1-L*math.sin(a+s*.45):.1f}" stroke="{INK}" stroke-width="{sw}" stroke-linecap="round"/>')
    if label:
        tw=len(label)*22+24
        o.append(f'<rect x="{lx-tw/2}" y="{ly-26}" width="{tw}" height="36" rx="8" fill="#FFFEF8"/>')
        text(lx,ly,label,21)
def zone(x,y,w,h,fill,title):
    box(x,y,w,h,fill,sw=3.4,r=26)
    hl(x+24,y+20,len(title)*30+16,40)
    text(x+32,y+52,title,32,700,"start")

# title
text(W/2,78,"AI 学习工作流 · 多 Bot 协作架构",54,800)
text(W/2,124,"目标：成为 AI 全栈 / AI Agent 工程师",28)

# Roles zone
zone(40,160,560,880,B,"【角色】")
roles=[("🧠","BrainStorm（主 bot）",["头脑风暴 · 调度 · 拍板","通知用户 · 写 manifest"]),
("🔍","Searcher",["搜索 + 验证链接"]),
("⚖","质量评估（两阶段）",["读 SKILL.md 初筛","→ 深读源码打分"]),
("📚","Memory",["学习历史归档"]),
("🛠","优化规划师",["复盘 · 出方案"]),
("✏","手绘风技术配图",["画图"])]
yy=240
for ic,n,d in roles:
    h=56+len(d)*34
    box(70,yy,500,h,"#FFFFFF",sw=2.4,r=14)
    text(94,yy+42,n,27,700,"start")
    lines(94,yy+80,d,22,anchor="start")
    yy+=h+14

# Main loop zone
zone(640,160,1100,880,G,"【主循环】每轮深挖")
steps=[("①","用户发来兴趣内容",["视频 / 文章 / 主题","B站 · 小红书 · skillhub"]),
("②","BrainStorm 头脑风暴",["扩展关键词","如 webpack → Vite"]),
("③","Searcher",["搜索并验证链接"]),
("④","质量评估",["两阶段打分","按质量与相关度排序"]),
("⑤","BrainStorm",["发排序推荐给用户"]),
("⑥","用户挑选条目",["选出感兴趣的条目"])]
bw,bh=300,190
pos={0:(680,250),1:(1040,250),2:(1400,250),3:(1400,640),4:(1040,640),5:(680,640)}
for i,(n,t,d) in enumerate(steps):
    x,y=pos[i]; box(x,y,bw,bh,"#FFFFFF",sw=2.8)
    text(x+bw/2,y+54,n+" "+t,26,700)
    lines(x+bw/2,y+100,d,22)
c=lambda i:pos[i]
arrow([(980,345),(1036,345)])
arrow([(1340,345),(1396,345)])
arrow([(1550,440),(1550,636)])
arrow([(1400,735),(1344,735)])
arrow([(1040,735),(984,735)])
# loop back 6 -> 2
arrow([(830,640),(900,560),(1120,520),(1190,444)],"回到② 深挖",1000,560,dash="10 8")

# Review branch
zone(1780,160,580,520,P,"【复盘支线】每轮结束")
rv=["BrainStorm 把问题发给优化规划师","规划师出方案","双方讨论，BrainStorm 拍板","更新各 bot 规则"]
ry=250
for i,s in enumerate(rv):
    box(1820,ry,500,64,"#FFFFFF",sw=2.4,r=12); text(2070,ry+42,s,23)
    if i<3: arrow([(2070,ry+66),(2070,ry+96)])
    ry+=100
arrow([(1260,830),(1260,960),(1760,960),(1760,280),(1816,282)],"每轮结束",1560,960,dash="10 8")

# Fallback
zone(1780,720,580,320,V,"【资源获取降级顺序】")
fb=["① 直连","② 镜像","③ 云电脑浏览器已登录会话","④ 用户手动上传"]
for i,s in enumerate(fb):
    text(1830,820+i*54,s,25,anchor="start")
    if i<3: text(2320,820+i*54,"↓ 失败",20,anchor="end",color="#5A6B85")

# Data line
zone(40,1080,2320,440,Y,"【数据线】")
box(90,1200,360,150,"#FFFFFF",sw=2.8); text(270,1260,"BrainStorm 拍板",27,700); text(270,1306,"写入结果",22)
box(620,1180,420,190,"#FFFFFF",sw=3.2); text(830,1244,"manifest.json",29,700); hl(690,1280,280,34,"#FFD3E0"); text(830,1308,"看板唯一数据源",23)
box(1220,1160,620,230,"#FFFFFF",sw=3.2); text(1530,1218,"Sketchmind 手绘风看板",28,700)
lines(1530,1262,["静态网站 · grok cli 生成","GitHub 私有仓库 123sssdd/Sketchmind","展示：评分 · 已读 · 已应用 · 效果"],22)
box(1980,1200,340,150,"#FFFFFF",sw=2.8); text(2150,1260,"Memory",27,700); text(2150,1306,"学习历史归档",22)
arrow([(450,1275),(616,1275)],"写入",533,1250)
arrow([(1040,1275),(1216,1275)],"驱动",1128,1250)
arrow([(270,1350),(270,1460),(2150,1460),(2150,1354)],"同时发送结果归档",1200,1470)
# main loop -> data
arrow([(1120,830),(1120,1010),(270,1010),(270,1196)],"拍板后",600,1010)

svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="100%" height="100%" fill="#FFFEF8"/>'+"\n".join(o)+'</svg>'
open("learning-workflow.svg","w").write(svg)
cairosvg.svg2png(bytestring=svg.encode(),write_to="learning-workflow.png")
