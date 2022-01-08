100 print "{144}{147}";
200 poke 53281,6:poke 53280,0
300 dim cl(7):cl(0)=1:cl(1)=4:cl(2)=13:cl(3)=3:cl(4)=7:cl(5)=10: cl(6)=14
400 dim bg(7):bg(0)=6:bg(1)=12:bg(2)=9:bg(3)=2 : bi=0:bw=0
500 dim hs(39)
600 for x=0 to 39 step 2
700 y2=23-int(rnd(1)*5) : hs(x)=y2: hs(x+1)=y2
800 for y=23 to y2 step -1
900 z0=x:z1=y+1:z2=160: z3=0: gosub 8300
1000 next
1100 next
1200 for t=1 to 20
1300 x=int(rnd(1)*40): y=int(rnd(0)*hs(x))
1400 z0=x:z1=y:z2=46:z3=14:gosub 7700
1500 next
1600 x=20:y=25
1700 rem -- start top loop ---------------
1800 fort=1to1000000
1900 poke 53281,bg(bi)
2000 bw=bw+1:ifbw>4thenbw=0:bi=bi+1:ifbi>3then bi=0
2100 x=int(rnd(1)*40): y=int(rnd(0)*hs(x))
2200 z0=x:z1=y:z2=46:z3=1:gosub 7700
2300 x=int(rnd(1)*40)
2400 y2=5+int(rnd(0)*5):cf=cl(int(rnd(1)*7)):z3=cf
2500 fory=hs(x)-5 toy2 step-1
2600 z0=x:z1=y:z2=46:gosub7700
2700 next
2800 print "{19}{5}":print spc(14);"happy 2022"
2900 z0=x:z1=y+1:z2=81:gosub6900
3000  z0=x:z1=y+1:z2=81:z3=cf:gosub7600
3100 rem --boom
3200 for b=1to49  :poke 53281,b
3300 next b: poke 53281,bg(bi)
3400 x1=x-1:y1=y: x2=x+1:y2=y
3500 x3=x-1:y3=y+2: x4=x+1:y4=y+2
3600 z3 = cf
3700 for ex=1 to 4 step 1
3800  z0=x1:z1=y1:z2=46:gosub7700
3900  z0=x2:z1=y2:z2=46:gosub7700
4000  z0=x3:z1=y3:z2=46:gosub7700
4100  z0=x4:z1=y4:z2=46:gosub7700
4200  x1=x1-1:y1=y1-1
4300  x2=x2+1:y2=y2-1
4400  x3=x3-1:y3=y3+1
4500  x4=x4+1:y4=y4+1
4600 next ex
4700  z0=x:z1=y+1:z2=32:z3=6:gosub7600
4800 foryy=hs(x)toy2 step-1
4900 z0=x:z1=yy:z2=32:gosub6900
5000 next
5100 x1=x-1:y1=y: x2=x+1:y2=y
5200 x3=x-1:y3=y+2: x4=x+1:y4=y+2
5300 for ex=1 to 4 step 1
5400  z0=x1:z1=y1:z2=32:gosub6900
5500  z0=x2:z1=y2:z2=32:gosub6900
5600  z0=x3:z1=y3:z2=32:gosub6900
5700  z0=x4:z1=y4:z2=32:gosub6900
5800  x1=x1-1:y1=y1-1
5900  x2=x2+1:y2=y2-1
6000  x3=x3-1:y3=y3+1
6100  x4=x4+1:y4=y4+1
6200 next ex
6300  z0=x:z1=y+1:z2=32:gosub6900
6400 print "{19}":print spc(14);"          "
6500 next
6600 rem -- end top loop ---------------
6700 end
6800 rem plot char --------------
6900 za=1024+z0+(z1*40)
7000 pokeza,z2
7100 return
7200 rem plot col --------------
7300 za=55296+z0+(z1*40)
7400 pokeza,z2
7500 return
7600 rem plot char col --------------
7700 za=55296+z0+(z1*40)
7800 pokeza,z3
7900 za=1024+z0+(z1*40)
8000 pokeza,z2
8100 return
8200 rem plot double char colr --------------
8300 za=55296+z0+(z1*40)
8400 pokeza,z3: pokeza+1,z3
8500 za=1024+z0+(z1*40)
8600 pokeza,z2:pokeza+1,z2
8700 return
