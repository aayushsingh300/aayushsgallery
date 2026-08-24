import sys, zlib, struct

def read_png(p):
    f=open(p,"rb").read(); pos=8; w=h=ct=None; idat=b""
    while pos<len(f):
        ln=struct.unpack(">I",f[pos:pos+4])[0]; typ=f[pos+4:pos+8]; d=f[pos+8:pos+8+ln]
        if typ==b"IHDR": w,h,bd,ct=struct.unpack(">IIBB",d[:10])
        elif typ==b"IDAT": idat+=d
        pos+=12+ln
    raw=zlib.decompress(idat); ch=4 if ct==6 else 3; stride=w*ch
    prev=bytearray(stride); rows=[]; p=0
    for _ in range(h):
        ft=raw[p]; p+=1; line=bytearray(raw[p:p+stride]); p+=stride
        for i in range(stride):
            a=line[i-ch] if i>=ch else 0; b=prev[i]; c=prev[i-ch] if i>=ch else 0
            if ft==1: line[i]=(line[i]+a)&255
            elif ft==2: line[i]=(line[i]+b)&255
            elif ft==3: line[i]=(line[i]+(a+b)//2)&255
            elif ft==4:
                pa=abs(b-c); pb=abs(a-c); pc=abs(a+b-2*c)
                pr=a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
                line[i]=(line[i]+pr)&255
        prev=line; rows.append(bytes(line))
    return w,h,ch,rows

def write_png(p,w,h,ch,rows):
    ct=6 if ch==4 else 2
    raw=b"".join(b"\x00"+r for r in rows)
    def chunk(t,d):
        c=struct.pack(">I",len(d))+t+d
        return c+struct.pack(">I",zlib.crc32(t+d)&0xffffffff)
    out=b"\x89PNG\r\n\x1a\n"+chunk(b"IHDR",struct.pack(">IIBBBBB",w,h,8,ct,0,0,0))
    out+=chunk(b"IDAT",zlib.compress(raw,9))+chunk(b"IEND",b"")
    open(p,"wb").write(out)

src,dst,keep=sys.argv[1],sys.argv[2],int(sys.argv[3])
w,h,ch,rows=read_png(src)
write_png(dst,w,keep,ch,rows[:keep])
print(f"cropped {w}x{h} -> {w}x{keep}")
