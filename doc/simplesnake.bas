100 fort=0to39:poke1024+t,102:next
110 print"{clear}"
120 fort=0to39:poke1024+t,102:next
130 fort=0to39:poke1984+t,102:next
140 fort=0to23:poke1024+(t*40),102:next
150 fort=0to23:poke1063+(t*40),102:next
160 x=20:y=20:sc=0:dx=1:dy=0:sw=5:sl=sw
170 geta$
180 ifa$="q"thendy=-1:dx=0
190 ifa$="a"thendy=1:dx=0
200 ifa$="o"thendy=0:dx=-1
210 ifa$="p"thendy=0:dx=1
220 sl=sl-1:ifsl>0thengoto170
230 sl=sw:sc=sc+1
240 poke1024+x+(y*40),81
250 print"{home}";sc:sl=sl-1
260 x=x+dx:y=y+dy
270 ad=1024+x+(y*40)
280 ifpeek(ad)<>32thengoto300
290 goto170
300 print" ** game over ** "
310 geta$ : ifa$<>" "thengoto310
320 goto110
