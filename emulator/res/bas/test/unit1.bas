1 xon :cls
10 gosub 1010:gosub 500
11 gosub 1020:gosub 500
12 gosub 1030:gosub 500
13 gosub 1040:gosub 500
14 gosub 1050:gosub 500
15 gosub 1060:gosub 500
16 gosub 1070:gosub 500
17 gosub 1080:gosub 500
18 gosub 1090:gosub 500
19 gosub 1100:gosub 500
20 gosub 1110:gosub 500
21 gosub 1120:gosub 500
22 gosub 1130:gosub 500
499 end
500 print "{5}testcase ";tc ;" ";
505 if i = 1then print "ignore":return
510 if r =e then re$ ="{30}ok"
520 if r <>e then re$ ="{28}error"
530 ? re$ ;"{144}";tc$
534 if r <>e then print "{28}";
535 if r <>e then print "r(";r ;")<>";
536 if r <>e then print "e(";e ;")"
1010 rem testcase  1---
1011 tc = 1:tc$ ="addition":i = 0
1012 r =100+100
1019 e =200:return
1020 rem testcase  2---
1021 tc = 2:tc$ ="substraction":i = 0
1022 r =100-100
1029 e = 0:return
1030 rem testcase  3---
1031 tc = 3:tc$ ="multiplication":i = 0
1032 r =100/100
1039 e = 1:return
1040 rem testcase  4---
1041 tc = 4:tc$ ="division":i = 0
1042 r =100/100
1049 e = 1:return
1050 rem testcase  5---
1051 tc = 5:tc$ ="add&multiply":i = 0
1052 r =15+15*16+17
1059 e =272:return
1060 rem testcase  6---
1061 tc = 6:tc$ ="add&multiply2":i = 0
1062 r =15*15+16*17
1069 e =497:return
1070 rem testcase  7---
1071 tc = 7:tc$ ="sub&multiply":i = 0
1072 r =15*15-16*17
1079 e =-47:return
1080 rem testcase  8---
1081 tc = 8:tc$ ="sub&multiply2":i = 0
1082 r =15-15*16-17
1089 e =-242:return
1090 rem testcase  7---
1091 tc = 7:tc$ ="sub&div":i = 1
1092 r =15/15-16/17
1099 e =-47:return
1100 rem testcase  8---
1101 tc = 8:tc$ ="sub&div2":i = 1
1102 r =15-15/16-17
1109 e =-242:return
1110 rem testcase  9---
1111 tc = 9:tc$ ="sub&div2":i = 0
1112 r =15-33/ 3-17
1119 e =-13:return
1120 rem testcase 10---
1121 tc =10:tc$ ="add+pow":i = 0
1122 r =15+15{94} 2+13{94} 3
1129 e =2437:return
1130 rem testcase 11---
1131 tc =11:tc$ ="def fn":i = 0
1132 def fn f11 (x )=3.5*x
1135 r =fn f11 (15)
1139 e =52.5:return
