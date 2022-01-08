100 mode  3
200 turbo
300 bgcolor  0:border 11
400 gcolors  1
500 gcls
600 dim x ( 2):dim y ( 2):dim dx ( 2):dim dy ( 2)
650 dim pc (16)
651 pc ( 0)=11:pc ( 1)=15:pc ( 2)=10:pc ( 3)=13
652 pc ( 4)=10:pc ( 5)=13:pc ( 6)=14:pc ( 7)= 8
653 pc ( 8)= 7:pc ( 9)= 8:pc (10)= 4:pc (11)=12
654 pc (12)=11
655 pc (13)= 3:pc (14)= 6:pc (15)= 1
660 dim rb (28)
661 for t = 0to 27:read c :rb (t )=c :next
700 x ( 0)= 0:dx ( 0)=4.01
800 y ( 0)= 0:dy ( 0)=2.1
900 x ( 1)=100:dx ( 1)=3.02
1000 y ( 1)=100:dy ( 1)=1.09
1100 c = 1:ci = 0:d =20:rc = 0
1200 tm =200
1300 x ( 0)=x ( 0)+dx ( 0)
1400 x ( 1)=x ( 1)+dx ( 1)
1500 y ( 0)=y ( 0)+dy ( 0)
1600 y ( 1)=y ( 1)+dy ( 1)
1700 if x ( 0)< 0then x ( 0)= 0:dx ( 0)=-dx ( 0)
1800 if x ( 1)< 0then x ( 1)= 0:dx ( 1)=-dx ( 1)
1900 if y ( 0)< 0then y ( 0)= 0:dy ( 0)=-dy ( 0)
2000 if y ( 1)< 0then y ( 1)= 0:dy ( 1)=-dy ( 1)
2100 if x ( 0)>159then x ( 0)=159:dx ( 0)=-dx ( 0)
2200 if x ( 1)>159then x ( 1)=159:dx ( 1)=-dx ( 1)
2300 if y ( 0)>199then y ( 0)=199:dy ( 0)=-dy ( 0)
2400 if y ( 1)>199then y ( 1)=199:dy ( 1)=-dy ( 1)
2500 line x ( 0),y ( 0),x ( 1),y ( 1),ci + 1
2600 line x ( 1),y ( 0),x ( 0),y ( 1),ci + 1
2700 line x ( 0),y ( 1),x ( 1),y ( 0),ci + 1
2800 line x ( 1),y ( 1),x ( 0),y ( 0),ci + 1
2900 d =d - 1:if d < 0then d =20:rc = 1
3000 if rc = 1then c =c + 1:ci =ci + 1
3100 if rc = 1then if ci > 2then ci = 0
3200 if rc = 1then if c >27then c = 0
3300 if rc = 1then gcoldef ci ,rb (c )
3400 rc = 0
3500 tm =tm - 1:if tm < 0then tm =200:rf = 1
3600 if rf = 1then cc =int (rnd ( 1)*15)
3700 if rf = 1then bgcolor cc
3800 if rf = 1then cc =pc (cc )
3900 if rf = 1then border cc :gcls :rf = 0
4000 wjiffy
4100 goto 1300
5000 data  0,11,12,15, 1, 7,10, 8, 4, 2, 4, 6,14
5001 data  3,13, 5, 7,15,12, 9, 8,15, 1, 3,15,12, 9,11
