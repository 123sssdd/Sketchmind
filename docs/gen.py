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
        tw=max(len(label)*18+28, 80)
        o.append(f'<rect x="{lx-tw/2}" y="{ly-26}" width="{tw}" height="36" rx="8" fill="#FFFEF8"/>')
        text(lx,ly,label,20)
def zone(x,y,w,h,fill,title):
    box(x,y,w,h,fill,sw=3.4,r=26)
    hl(x+24,y+20,len(title)*28+20,40)
    text(x+32,y+52,title,30,700,"start")

# title
text(W/2,78,"AI 学习工作流 · 多 Bot 协作架构",54,800)
text(W/2,124,"目标：成为 AI 全栈 / AI Agent 工程师",28)

# Roles zone
zone(40,160,560,880,B,"【角色】")
roles=[
("BrainStorm（主 bot）",["主调度 · 头脑风暴 · 拍板","通知用户 · 通知 Memory","不直接改仓库"]),
("Searcher",["搜索 + 验证链接"]),
("质量评估（两阶段）",["读 SKILL.md 初筛","→ 深读源码打分"]),
("Memory（唯一写入者）",["更新 manifest.json","并 push 到仓库"]),
("优化规划师",["复盘 · 出方案"]),
("手绘风技术配图",["画图"]),
]
yy=230
for n,d in roles:
    h=52+len(d)*32
    box(70,yy,500,h,"#FFFFFF",sw=2.4,r=14)
    text(94,yy+38,n,26,700,"start")
    lines(94,yy+74,d,21,anchor="start")
    yy+=h+12

# Main loop zone
zone(640,160,1100,880,G,"【主循环】每轮深挖")
steps=[
("①","用户发来兴趣内容",["视频 / 文章 / 主题","B站 · 小红书 · skillhub"]),
("②","BrainStorm 头脑风暴",["扩展关键词","如 webpack → Vite"]),
("③","Searcher",["搜索并验证链接"]),
("④","质量评估",["两阶段打分","按质量与相关度排序"]),
("⑤","BrainStorm",["把推荐发给用户"]),
("⑥","用户挑选条目",["选出感兴趣的条目"]),
]
bw,bh=300,190
pos={0:(680,250),1:(1040,250),2:(1400,250),3:(1400,640),4:(1040,640),5:(680,640)}
for i,(n,t,d) in enumerate(steps):
    x,y=pos[i]; box(x,y,bw,bh,"#FFFFFF",sw=2.8)
    text(x+bw/2,y+54,n+" "+t,26,700)
    lines(x+bw/2,y+100,d,22)
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
    box(1820,ry,500,64,"#FFFFFF",sw=2.4,r=12); text(2070,ry+42,s,22)
    if i<3: arrow([(2070,ry+66),(2070,ry+96)])
    ry+=100
# from step 5 bottom toward review
arrow([(1260,830),(1260,960),(1760,960),(1760,280),(1816,282)],"每轮结束",1560,960,dash="10 8")

# Fallback
zone(1780,720,580,320,V,"【资源获取降级顺序】")
fb=["① 直连","② 镜像","③ 云电脑浏览器已登录会话","④ 用户手动上传"]
for i,s in enumerate(fb):
    text(1830,820+i*54,s,25,anchor="start")
    if i<3: text(2320,820+i*54,"↓ 失败",20,anchor="end",color="#5A6B85")

# Data line — KEY CHANGES
zone(40,1080,2320,440,Y,"【数据线】BrainStorm 不直接改仓库 · Memory 是唯一写入者")

# BrainStorm notify
box(80,1190,380,200,"#FFFFFF",sw=2.8)
text(270,1250,"BrainStorm",28,700)
lines(270,1295,["通知要沉淀的内容","（只调度，不写仓库）"],22)

# Memory write
box(560,1180,420,220,"#FFFFFF",sw=3.2)
hl(600,1195,340,36,"#FFD3E0")
text(770,1222,"Memory · 唯一写入者",26,700)
lines(770,1270,["更新 manifest.json","并 push 到仓库"],23)

# manifest.json
box(1080,1195,380,190,"#FFFFFF",sw=3.2)
text(1270,1260,"manifest.json",30,700)
hl(1140,1290,260,34,"#FFE27A")
text(1270,1318,"看板唯一数据文件",22)

# GitHub Pages board
box(1560,1160,760,250,"#FFFFFF",sw=3.2)
text(1940,1215,"GitHub Pages 看板",28,700)
lines(1940,1255,[
    "https://123sssdd.github.io/Sketchmind/",
    "展示：评分 / 已读 / 已应用 / 效果",
],21)
hl(1640,1320,600,40,"#FFD3E0")
text(1940,1350,"无数据库 · 无 /api/hub · Pages 只读 manifest",21,700)

# arrows in data line
arrow([(460,1290),(556,1290)],"通知沉淀",508,1260)
arrow([(980,1290),(1076,1290)],"写并 push",1028,1260)
arrow([(1460,1290),(1556,1290)],"Pages 读取",1508,1260)

# main loop -> data (from ⑤)
arrow([(1190,830),(1190,1010),(270,1010),(270,1186)],"⑤ 后通知",700,1010)

svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="100%" height="100%" fill="#FFFEF8"/>'+"\n".join(o)+'</svg>'
open("learning-workflow.svg","w").write(svg)
cairosvg.svg2png(bytestring=svg.encode(),write_to="learning-workflow.png")
print("ok", len(svg))
