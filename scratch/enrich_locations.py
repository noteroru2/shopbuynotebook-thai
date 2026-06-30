# -*- coding: utf-8 -*-
"""
Enrich Locations Script (2026)
This script audits and mass-expands all thin province and zone location files inside src/content/locations/
to comply with 2026 SEO, AEO, and GEO best practices. It preserves localized district data, merges existing FAQs,
creates dynamic internal linking clusters within regions, and embeds helpful visual assets (photo guides, trust badges)
with province-specific alt tags.

Author: Antigravity
"""

import os
import re
import sys
import yaml

# Configure UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

loc_dir = os.path.join(os.getcwd(), 'src', 'content', 'locations')
print(f"Target Location Directory: {loc_dir}")

# Stable string hashing function for paragraph rotation
def stable_hash(s):
    h = 0
    for char in s:
        h = (31 * h + ord(char)) & 0xFFFFFFFF
    return h

# Pick an item consistently using hash
def pick(arr, index):
    return arr[index % len(arr)]

# Rotating content block definitions
WHO_A = [
    'กลุ่มแรกคือผู้ที่ต้องการขายโน๊ตบุ๊คมือสองหลังอัปเกรดเครื่องใหม่ หรือเปลี่ยนมาใช้คอมพิวเตอร์ตั้งโต๊ะแทน การมีรูปชัดและสเปกครบจะช่วยให้การประเมินเบื้องต้นผ่านไลน์ @webuy เป็นไปอย่างรวดเร็วแม้อยู่คนละพื้นที่กับทีมงาน',
    'กลุ่มที่สองคือนักเรียน นักศึกษา และผู้ปกครองที่อยากปิดดีลก่อนเปิดเทอม โดยเฉพาะเมื่อเครื่องเริ่มอืดหรือแบตไม่ทนการพิมพ์งาน การส่งรูปประเมินก่อนนัดช่วยให้วางแผนเวลาและค่าใช้จ่ายได้ชัดเจน',
    'กลุ่มที่สามคือพนักงานออฟฟิศหรือฟรีแลนซ์ที่ใช้โน๊ตบุ๊คเป็นหลัก หากต้องการขายเพื่อเปลี่ยนรุ่นหรือย้ายเมือง การแจ้งรุ่น CPU RAM SSD และการ์ดจอ (ถ้ามี) จะช่วยให้การประเมินใกล้เคียงสภาวะตลาดมือสองมากขึ้น',
    'กลุ่มที่สี่คือร้านค้า องค์กร หรือหน่วยงานที่มีเครื่องหลายเครื่องรอการจัดการ แนะนำแยกรายการเป็นเครื่องละแชทหรือเครื่องละหัวข้อเพื่อไม่ให้ข้อมูลปนกัน และถ่ายรูปแต่ละเครื่องให้เห็นสติ๊กเกอร์รุ่นชัดเจน',
    'กลุ่มที่ห้าคือผู้ที่มีเครื่องเสียบางอาการแต่ยังอยากรู้ว่าควรเก็บซ่อมหรือขายดีกว่า การส่งวิดีโอสั้น ๆ ประกอบรูปนิ่งช่วยให้เห็นพฤติกรรมเครื่องจริง โดยไม่ต้องอ้างว่ามีบริการซ่อมถึงที่ในจังหวัดนั้น หากต้องการคำแนะนำเชิงลึกให้สอบถามผ่านไลน์ @webuy หรือโทร 0642579353'
]

WHO_B = [
    'อีกกลุ่มที่เหมาะกับบริการคือผู้ที่ซื้อเครื่องมือสองมาแล้วไม่เข้ากับงานจริง หรือเครื่องรุ่นเก่าที่ยังเปิดติดแต่ช้า การขายทิ้งเพื่อรวบรวมเงินซื้อรุ่นใหม่จึงเป็นเรื่องปกติ โดยควรเริ่มจากการสำรองข้อมูลและเตรียมบัญชีระบบให้พร้อมปลดก่อนส่งมอบ',
    'ผู้ที่อยากเช็คราคาโน๊ตบุ๊คก่อนตัดสินใจขายจริงก็ใช้ช่องทางเดียวกันได้ แค่แจ้งว่าต้องการประเมินเบื้องต้นเพื่อเปรียบเทียบกับราคาตลาดหรือราคาที่เพื่อนเคยขาย โดยไม่มีข้อผูกมัดในการส่งเครื่องจนกว่าจะตกลงเงื่อนไขชัดเจน'
]

PRICE_LEAD = [
    'ราคาประเมินโน๊ตบุ๊คในแต่ละพื้นที่ไม่ได้ถูกกำหนดจากชื่อจังหวัดอย่างเดียว แต่ขึ้นกับรุ่น สเปก สภาพจริง และความต้องการตลาดมือสองในช่วงนั้น ดังนั้นการส่งข้อมูลให้ครบจึงสำคัญกว่าการพิมพ์คีย์เวิร์ดซ้ำ ๆ',
    'ปัจจัยหลักที่ทีมงานใช้ประกอบการประเมิน ได้แก่ ยี่ห้อและรุ่น ช่วงปีที่ผลิต CPU RAM SSD การ์ดจอ สุขภาพแบตเตอรี่ สภาพจอและบานพับ อุปกรณ์ที่มีครบหรือไม่ และอาการเสียที่แจ้งตรงไปตรงมา',
    'หากข้อมูลจากลูกค้าครบและรูปชัด การประเมินเบื้องต้นผ่านไลน์ @webuy จะใกล้เคียงผลจริงหน้างานมากขึ้น แต่ยังไม่ใช่การการันตีราคาสุดท้ายจนกว่าจะมีการตรวจสภาพจริงและตกลงเงื่อนไขกันแล้ว'
]

# Standard template sections with visual image embeds
def build_markdown_body(title, slug, region, intro_text, sub_areas_html, meeting_hook, neighbors_links):
    h = stable_hash(slug)
    who1 = pick(WHO_A, h)
    who2 = pick(WHO_B, h + 1)
    price1 = pick(PRICE_LEAD, h + 2)
    price2 = pick(PRICE_LEAD, h + 3)
    
    # Clean up intro text to prevent double headings
    intro_lines = intro_text.strip().split('\n')
    clean_lines = []
    for line in intro_lines:
        if line.strip().startswith('##') or line.strip().startswith('#'):
            continue
        clean_lines.append(line)
    clean_intro = '\n'.join(clean_lines).strip()
    
    body = f"""{clean_intro}

หากต้องการภาพรวมและบริการทั่วประเทศ อ่านเพิ่มได้ที่หน้า [บริการรับซื้อโน๊ตบุ๊คหลายยี่ห้อ](/รับซื้อโน๊ตบุ๊ค/) และดูแนวทางบริการทั่วประเทศที่ [พื้นที่ให้บริการรับซื้อโน๊ตบุ๊ค](/พื้นที่ให้บริการ/) รวมถึง [รับซื้อโน๊ตบุ๊คมือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)

## รับซื้อโน๊ตบุ๊คใน{title} เหมาะกับใครบ้าง

{who1}

{who2}

## อำเภอและพื้นที่สำคัญใน{title}ที่สามารถส่งรูปประเมินได้

รายชื่ออำเภอด้านล่างใช้เป็นแนวทางการพูดคุยเรื่องโลเคชันคร่าว ๆ ไม่ได้แปลว่ามีจุดบริการครบทุกแห่งในทุกตำบล แต่ช่วยให้คุณระบุพื้นที่ได้ชัดเมื่อติดต่อไลน์ @webuy

{sub_areas_html}

เมื่อคุณแจ้งว่าอยู่ใกล้เขตเมืองหรืออำเภอใด ทีมงานจะช่วยอธิบายแนวทางการนัดพบในบริเวณตัวเมือง จุดขนส่ง หรือสถานที่สาธารณะที่เหมาะสมหลังตกลงเวลา โดยยังคงย้ำว่าควรส่งรูปประเมินก่อนเสมอ

## จุดนัดรับหรือแนวทางส่งเครื่องใน{title}

{meeting_hook} แนวทางทั่วไปคือเลือกบริเวณตัวเมืองหรือจุดที่มีคนพลุกพล่านเมื่อต้องนัดตรวจเครื่อง และใช้ขนส่งที่มีเลขพัสดุเมื่อส่งไกลหรือสะดวกกว่า หากอยู่ต่างอำเภอใน{title} แจ้งระยะทางหรือเส้นทางหลักที่ใช้บ่อยในแชทเพื่อให้คำแนะนำเหมาะกับเคส

ไม่ควรตีความเองว่ามีทีมประจำอยู่ในทุกอำเภอ ควรสอบถามพื้นที่ให้บริการและขั้นตอนที่ชัดเจนผ่านไลน์ @webuy หรือโทร 0642579353

![นัดรับตรวจเช็กเครื่องด่วนและโอนเงินทันที {title}](/images/trust/rubsue-notebook-trust-cash-payment.webp)
*มั่นใจได้ 100% กับการตกลงนัดรับในที่สาธารณะ ปลอดภัย ตรวจเช็กเครื่องรวดเร็ว และโอนเงินทันทีเมื่อตกลงสภาพ*

## วิธีส่งรูปเพื่อเช็คราคาโน๊ตบุ๊คก่อนขาย

1. ถ่ายรูปหน้าเครื่องและหน้าจอให้เห็นสภาพจอชัดเจน
2. ถ่ายรูปคีย์บอร์ดและตัวเครื่องด้านข้างเพื่อดูรอยและบานพับ
3. ถ่ายรูปฝาหลังหรือสติ๊กเกอร์รุ่นเพื่อยืนยันรุ่นเครื่อง
4. แจ้งรุ่น CPU RAM SSD และการ์ดจอถ้าทราบ หรือส่งรูปหน้าจอ System/Task Manager
5. แจ้งอาการเสียหรือสภาพเครื่องอย่างตรงไปตรงมา
6. แจ้งอุปกรณ์ที่มี เช่น ที่ชาร์จ กล่อง ใบเสร็จ
7. แอดไลน์ @webuy หรือโทร 0642579353 เพื่อส่งข้อมูลและสอบถามพื้นที่ให้บริการ

### คู่มือการถ่ายรูปเพื่อประเมินราคาใน{title}

เพื่อให้ประเมินราคาได้รวดเร็วและแม่นยำที่สุด แนะนำให้ถ่ายรูปตามคู่มือ 4 จุดสำคัญดังนี้:

- **รูปที่ 1: หน้าเครื่องขณะเปิดหน้าจอ** เพื่อเช็กสภาพการแสดงผลของหน้าจอใน{title}
  ![ถ่ายรูปโน๊ตบุ๊คด้านหน้าเปิดหน้าจอเพื่อเช็คสภาพจอ {title}](/images/photo-guide/rubsue-notebook-photo-front.webp)
  
- **รูปที่ 2: คีย์บอร์ดและทัชแพด** เพื่อดูสภาพปุ่มและรอยนิ้วมือจากการใช้งาน
  ![ถ่ายรูปคีย์บอร์ดและแป้นพิมพ์โน๊ตบุ๊ค {title}](/images/photo-guide/rubsue-notebook-photo-keyboard.webp)
  
- **รูปที่ 3: ฝาหลังหรือสติ๊กเกอร์โมเดลใต้เครื่อง** เพื่อยืนยันโมเดลและปีผลิตที่แน่นอน
  ![ถ่ายรูปฝาหลังและสติ๊กเกอร์รุ่นโน๊ตบุ๊คก่อนขาย {title}](/images/photo-guide/rubsue-notebook-photo-back.webp)
  
- **รูปที่ 4: สายชาร์จและอุปกรณ์เสริม** เพื่อประเมินความครบของอุปกรณ์เสริมดั้งเดิมของคุณ
  ![ถ่ายรูปสายชาร์จและอุปกรณ์เสริมโน๊ตบุ๊ค {title}](/images/photo-guide/rubsue-notebook-photo-accessories.webp)

## รับซื้อโน๊ตบุ๊คสภาพไหนบ้างใน{title}

รับประเมินทั้งเครื่องใช้งานปกติ เครื่องเก่า เครื่องตกรุ่น กรณีเปิดไม่ติดบางสาเหตุ จอแตก แบตเสื่อม ไม่มีที่ชาร์จ คีย์บอร์ดเสีย รวมถึง Gaming Notebook และ MacBook โดยดูจากรุ่นและสภาพจริงเป็นหลัก

อ่านเงื่อนไขเพิ่มเติมได้ที่ [รับซื้อโน๊ตบุ๊คเครื่องเสีย](/รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/) · [เปิดไม่ติด](/รับซื้อโน๊ตบุ๊ค/เปิดไม่ติด/) · [จอแตก](/รับซื้อโน๊ตบุ๊ค/จอแตก/) · [แบตเสื่อม](/รับซื้อโน๊ตบุ๊ค/แบตเสื่อม/) · [MacBook](/รับซื้อโน๊ตบุ๊ค/macbook/) · [Gaming Notebook](/รับซื้อโน๊ตบุ๊ค/gaming/)

## ราคาประเมินโน๊ตบุ๊คใน{title}ขึ้นอยู่กับอะไร

{price1}

{price2}

นอกจากนี้ยังมีผลจากความครบของข้อมูลที่ลูกค้าส่งมา หากรูปชัดและสเปกตรง การประเมินเบื้องต้นจะลดช่องว่างของความไม่แน่นอนก่อนหน้างาน

ดูแนวทางเชิงละเอียดเพิ่มเติมที่ [เช็คราคาโน๊ตบุ๊คก่อนขาย](/เช็คราคาโน๊ตบุ๊ค/) และ [ตีราคาโน๊ตบุ๊ค](/ตีราคาโน๊ตบุ๊ค/)

## ตัวอย่างแนวทางประเมินเครื่องในพื้นที่{title}

ข้อมูลต่อไปนี้เป็นเพียงสถานการณ์ตัวอย่าง ไม่ใช่เคสรับซื้อจริง และไม่ได้ระบุราคาตายตัว ทุกกรณีต้องประเมินตามรุ่นและสภาพจริง

- **สถานการณ์ตัวอย่างที่ 1:** MacBook Air ใช้งานปกติ มีที่ชาร์จ แบตรักษาสุขภาพได้ดี — มักเน้นดูรุ่นปี Apple ID และอุปกรณ์ครบ
- **สถานการณ์ตัวอย่างที่ 2:** Gaming Notebook มีการ์ดจอแยก แบตเสื่อมต้องเสียบไฟตลอด — ต้องดูอุณหภูมิการใช้งานจริงและสายอะแดปเตอร์
- **สถานการณ์ตัวอย่างที่ 3:** Notebook ทำงานทั่วไป เครื่องเก่าแต่ยังเปิดติด — ดูว่า SSD เป็นแบบใส่เพิ่มได้หรือไม่ และหน้าจอมีตำหนิหรือไม่
- **สถานการณ์ตัวอย่างที่ 4:** เปิดไม่ติดหรือจอแตก — ต้องแยกว่าเป็นที่จอ สายแพร บอร์ด หรือแบตบวม โดยใช้รูปและวิดีโอช่วยประกอบ

## ก่อนขายโน๊ตบุ๊คใน{title}ควรเตรียมอะไร

- สำรองข้อมูลสำคัญไว้ในที่เก็บอื่น
- ออกจากบัญชี Microsoft Google หรือ Apple ID ตามความเหมาะสมของเครื่อง
- ล้างข้อมูลส่วนตัวหรือรีเซ็ตตามขั้นตอนของระบบปฏิบัติการ
- เตรียมที่ชาร์จ กล่อง ใบเสร็จถ้ามี เพื่อให้ประเมินความครบของอุปกรณ์
- จดรุ่นและสเปกไว้ในกระดาษหรือไฟล์สั้น ๆ ก่อนถ่ายรูป
- ถ่ายรูปครบชุดตามหัวข้อด้านบน
- หลีกเลี่ยงการส่งรูปที่มีข้อมูลส่วนตัวหรือรหัสผ่านโผล่ในภาพ

## ขั้นตอนขายโน๊ตบุ๊คกับร้านรับซื้อโน๊ตบุ๊ค.com

1. แอดไลน์ @webuy
2. ส่งรูปเครื่อง รุ่น สเปก และอาการ
3. ทีมงานประเมินเบื้องต้น
4. ตกลงวิธีนัดรับหรือส่งเครื่องหลังสอบถามพื้นที่ให้บริการ
5. ตรวจสภาพจริงตามเงื่อนไข
6. ตกลงราคาและจ่ายเงินตามเงื่อนไขที่คุยกันไว้

## จังหวัดใกล้เคียงที่ให้บริการ

{neighbors_links}

## คำถามที่พบบ่อยเกี่ยวกับรับซื้อโน๊ตบุ๊ค{title}

คำถามด้านล่างของหน้านี้มีคำตอบแบบ FAQ พร้อมโครงสร้างข้อมูลสำหรับ SEO หากต้องการคุยเคสเฉพาะของคุณ แอดไลน์ @webuy ส่งรูปประเมินราคา หรือโทร 0642579353

---

**แอดไลน์ @webuy ส่งรูปประเมินราคา** หรือโทร **0642579353** · [รับซื้อโน๊ตบุ๊ค](/) · [พื้นที่ให้บริการรับซื้อโน๊ตบุ๊ค](/พื้นที่ให้บริการ/)
"""
    return body

# Main processing
def main():
    files = [f for f in os.listdir(loc_dir) if f.endswith('.md')]
    print(f"Found {len(files)} files to audit.")
    
    # Store all loaded data first for neighbor extraction
    locations = {}
    for f in sorted(files):
        path = os.path.join(loc_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        parts = content.split('---')
        if len(parts) >= 3:
            fm_text = parts[1]
            body_text = '---'.join(parts[2:])
            try:
                fm = yaml.safe_load(fm_text)
                if not fm:
                    continue
            except Exception as e:
                print(f"Error parsing YAML in {f}: {e}")
                continue
                
            locations[f] = {
                'frontmatter': fm,
                'body': body_text,
                'size': len(content),
                'path': path
            }

    # Dynamic BKK zones set
    bkk_zones = {'กรุงเทพ.md', 'นนทบุรี.md', 'บางนา.md', 'ปทุมธานี.md', 'พระราม2.md', 'รังสิต.md', 'รามคำแหง.md', 'ลาดพร้าว.md', 'สมุทรปราการ.md', 'สมุทรสาคร.md', 'ห้วยขวาง.md', 'ใกล้ฉัน.md'}

    # Determine region and map neighbors for each
    provinces_by_region = {}
    for f, loc in locations.items():
        fm = loc['frontmatter']
        title = fm.get('title', f.replace('.md', ''))
        
        # Determine region
        if f in bkk_zones:
            region = 'กรุงเทพและปริมณฑล'
        else:
            region = fm.get('region', 'ภาคกลาง')
            
        loc['region'] = region
        loc['title'] = title
        
        if region not in provinces_by_region:
            provinces_by_region[region] = []
        provinces_by_region[region].append((f, title))

    # Process each location file
    enriched_count = 0
    injected_count = 0
    
    for f, loc in locations.items():
        fm = loc['frontmatter']
        body = loc['body']
        size = loc['size']
        path = loc['path']
        title = loc['title']
        region = loc['region']
        
        # Don't expand the region hubs directly into typical province templates
        if title in ['ภาคอีสาน', 'ใกล้ฉัน']:
            print(f"Skipping core landing hub: {f}")
            continue
            
        # Get neighbors (other provinces/zones in the same region)
        region_list = provinces_by_region.get(region, [])
        other_locs = [item for item in region_list if item[0] != f]
        
        # consistently pick 4 neighbors based on hash of slug to keep it stable
        h = stable_hash(title)
        picked_neighbors = []
        if other_locs:
            for i in range(min(5, len(other_locs))):
                item = pick(other_locs, h + i)
                if item not in picked_neighbors:
                    picked_neighbors.append(item)
        
        # Build neighbor markdown links
        neighbor_links_str = " · ".join([f"[รับซื้อโน๊ตบุ๊ค{name}](/รับซื้อโน๊ตบุ๊ค/{name}/)" for _, name in picked_neighbors[:4]])
        if not neighbor_links_str:
            neighbor_links_str = "[บริการรับซื้อโน๊ตบุ๊คหลายยี่ห้อ](/รับซื้อโน๊ตบุ๊ค/)"
            
        # Check if the page is thin (size < 5000 bytes)
        if size < 5000:
            print(f"Enriching thin location page: {f} (size: {size} bytes)")
            
            # Enrich frontmatter properties
            fm['kind'] = 'location'
            fm['region'] = region
            fm['featuredImage'] = fm.get('featuredImage', '/images/rubsue-notebook-og.webp')
            fm['seoTitle'] = fm.get('seoTitle', f"รับซื้อโน๊ตบุ๊ค{title} ประเมินฟรีผ่านไลน์ @webuy | ร้านรับซื้อโน๊ตบุ๊ค.com")
            
            desc = f"รับซื้อโน๊ตบุ๊ค{title} รับซื้อโน๊ตบุ๊คมือสอง รับซื้อ Notebook, MacBook, Gaming Notebook เครื่องเก่า เครื่องเสียบางอาการ ส่งรูปเช็คราคาโน๊ตบุ๊คฟรีผ่านไลน์ @webuy หรือโทร 0642579353"
            fm['description'] = fm.get('description', desc)
            fm['ctaText'] = 'แอดไลน์ @webuy ส่งรูปประเมินราคา'
            
            # Ensure highlights, subAreas, meetingOptions, keywords exist
            sub_areas = fm.get('subAreas', [f"เมือง{title}"])
            meeting_options = fm.get('meetingOptions', ['นัดเจอในตัวเมือง', 'ส่งเครื่องผ่านขนส่ง'])
            highlights = fm.get('highlights', [f"เหมาะกับคนต้องการเช็กราคาไวใน{title}", "เริ่มจากประเมินผ่าน LINE เบื้องต้นได้"])
            keywords = fm.get('keywords', [f"รับซื้อโน๊ตบุ๊ค {title}", f"รับซื้อ Notebook {title}", f"รับซื้อ MacBook {title}"])
            
            fm['subAreas'] = sub_areas
            fm['meetingOptions'] = meeting_options
            fm['highlights'] = highlights
            fm['keywords'] = keywords
            
            # Generate local FAQs customized to this province
            std_faqs = [
                {
                    'question': f"รับซื้อโน๊ตบุ๊ค{title}ถึงที่ไหม",
                    'answer': f"ลูกค้าในจังหวัด{title}สามารถแอดไลน์ @webuy ส่งรูปเครื่อง รุ่น สเปก และสภาพเบื้องต้นเพื่อประเมินราคาก่อนนัดหรือสอบถามวิธีส่งเครื่องได้ โดยควรสอบถามพื้นที่ให้บริการและรายละเอียดการนัดหลังประเมินเบื้องต้น ไม่ควรสรุปเองว่ามีบริการถึงที่ในทุกพื้นที่"
                },
                {
                    'question': f"อยู่ต่างอำเภอใน{title}ส่งประเมินได้ไหม",
                    'answer': f"ได้ครับ การอยู่ต่างอำเภอไม่เป็นปัญหาต่อการส่งรูปและข้อความ แจ้งชื่ออำเภอคร่าว ๆ เพื่อให้คุยเรื่องการส่งเครื่องหรือจุดนัดที่เหมาะสมหลังตกลงเงื่อนไข"
                },
                {
                    'question': f"เช็คราคาโน๊ตบุ๊คก่อนส่งเครื่องได้ไหม",
                    'answer': f"ได้ครับ แนะนำส่งรูปและสเปกผ่านไลน์ @webuy เพื่อประเมินเบื้องต้นก่อน แล้วค่อยตัดสินใจเรื่องการส่งหรือนัดตรวจจริง"
                },
                {
                    'question': f"โน๊ตบุ๊คเสียใน{title}ขายได้ไหม",
                    'answer': f"หลายอาการยังเข้าเงื่อนไขรับซื้อได้หากแจ้งตรงไปตรงมา แนะนำดูหน้าเงื่อนไขเช่น เครื่องเสีย เปิดไม่ติด หรือจอแตก แล้วส่งวิดีโอประกอบ"
                },
                {
                    'question': f"ติดต่อประเมินราคายังไง",
                    'answer': f"แอดไลน์ @webuy หรือโทร 0642579353 แล้วส่งรูปและสเปกตามคำแนะในหน้านี้ เพื่อให้ประเมินเบื้องต้นผ่านไลน์ @webuy ก่อนคุยเรื่องการนัดหรือส่งเครื่อง"
                }
            ]
            
            # Merge existing custom FAQs if any
            existing_faqs = fm.get('faqs', [])
            merged_faqs = []
            seen_questions = set()
            for faq in existing_faqs:
                q = faq.get('question', '').strip()
                if q and q not in seen_questions:
                    merged_faqs.append(faq)
                    seen_questions.add(q)
            for faq in std_faqs:
                q = faq['question'].strip()
                if q not in seen_questions:
                    merged_faqs.append(faq)
                    seen_questions.add(q)
                    
            fm['faqs'] = merged_faqs[:8] # Limit to 8 FAQs
            
            # SubAreas HTML list
            sub_areas_html = "\n".join([f"- {d}" for d in sub_areas])
            
            # Meeting hook
            meeting_hook = meeting_options[0] if meeting_options else "นัดเจอในจุดสะดวกหรือส่งผ่านขนส่ง"
            if not meeting_hook.endswith('.') and not meeting_hook.endswith(' '):
                meeting_hook += ' '
                
            # Build frontmatter string
            fm_out = yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
            
            # Build markdown body
            body_out = build_markdown_body(
                title=title,
                slug=fm.get('slug', title),
                region=region,
                intro_text=body,
                sub_areas_html=sub_areas_html,
                meeting_hook=meeting_hook,
                neighbors_links=neighbor_links_str
            )
            
            # Write expanded page
            with open(path, 'w', encoding='utf-8', newline='\r\n') as file:
                file.write(f"---\n{fm_out}---\n{body_out}")
                
            enriched_count += 1
            
        else:
            # Page is already rich (e.g. Northeast provinces)
            # Inject visual guides and trust payment image if not already present
            modified = False
            
            # Check if trust badge is missing
            trust_str = f"![นัดรับตรวจเช็กเครื่องด่วนและโอนเงินทันที {title}](/images/trust/rubsue-notebook-trust-cash-payment.webp)"
            if trust_str not in body:
                # Find appropriate place in meeting/nัดรับ section
                pattern = r"(ไม่ควรตีความเองว่ามีทีมประจำอยู่ในทุกอำเภอ ควรสอบถามพื้นที่ให้บริการและขั้นตอนที่ชัดเจนผ่านไลน์ @webuy หรือโทร 0642579353)"
                if re.search(pattern, body):
                    replacement = f"\\1\n\n![นัดรับตรวจเช็กเครื่องด่วนและโอนเงินทันที {title}](/images/trust/rubsue-notebook-trust-cash-payment.webp)\n*มั่นใจได้ 100% กับการตกลงนัดรับในที่สาธารณะ ปลอดภัย ตรวจเช็กเครื่องรวดเร็ว และโอนเงินทันทีเมื่อตกลงสภาพ*"
                    body = re.sub(pattern, replacement, body)
                    modified = True
                    print(f"Injected trust cash image into rich page: {f}")
            
            # Check if photo guide is missing
            photo_str = "/images/photo-guide/rubsue-notebook-photo-front.webp"
            if photo_str not in body:
                # Find standard photo list end
                pattern = r"(7\. แอดไลน์ @webuy หรือโทร 0642579353 เพื่อส่งข้อมูลและสอบถามพื้นที่ให้บริการ)"
                if re.search(pattern, body):
                    photo_guide_md = f"""\\1

### คู่มือการถ่ายรูปเพื่อประเมินราคาใน{title}

เพื่อให้ประเมินราคาได้รวดเร็วและแม่นยำที่สุด แนะนำให้ถ่ายรูปตามคู่มือ 4 จุดสำคัญดังนี้:

- **รูปที่ 1: หน้าเครื่องขณะเปิดหน้าจอ** เพื่อเช็กสภาพการแสดงผลของหน้าจอใน{title}
  ![ถ่ายรูปโน๊ตบุ๊คด้านหน้าเปิดหน้าจอเพื่อเช็คสภาพจอ {title}](/images/photo-guide/rubsue-notebook-photo-front.webp)
  
- **รูปที่ 2: คีย์บอร์ดและทัชแพด** เพื่อดูสภาพปุ่มและรอยนิ้วมือจากการใช้งาน
  ![ถ่ายรูปคีย์บอร์ดและแป้นพิมพ์โน๊ตบุ๊ค {title}](/images/photo-guide/rubsue-notebook-photo-keyboard.webp)
  
- **รูปที่ 3: ฝาหลังหรือสติ๊กเกอร์โมเดลใต้เครื่อง** เพื่อยืนยันโมเดลและปีผลิตที่แน่นอน
  ![ถ่ายรูปฝาหลังและสติ๊กเกอร์รุ่นโน๊ตบุ๊คก่อนขาย {title}](/images/photo-guide/rubsue-notebook-photo-back.webp)
  
- **รูปที่ 4: สายชาร์จและอุปกรณ์เสริม** เพื่อประเมินความครบของอุปกรณ์เสริมดั้งเดิมของคุณ
  ![ถ่ายรูปสายชาร์จและอุปกรณ์เสริมโน๊ตบุ๊ค {title}](/images/photo-guide/rubsue-notebook-photo-accessories.webp)"""
                    body = re.sub(pattern, photo_guide_md, body)
                    modified = True
                    print(f"Injected photo guide images into rich page: {f}")
            
            if modified:
                # Build frontmatter string back
                fm_out = yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
                with open(path, 'w', encoding='utf-8', newline='\r\n') as file:
                    file.write(f"---\n{fm_out}---\n{body}")
                injected_count += 1
                
    print(f"\nExecution Complete!")
    print(f"Total Expanded (Thin -> Rich): {enriched_count} pages")
    print(f"Total Injected (Rich -> Visualized): {injected_count} pages")

if __name__ == '__main__':
    main()
