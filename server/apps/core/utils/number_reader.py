def read_number(n):
    """
    Reads a number in Vietnamese.
    Simple implementation up to billions.
    """
    if n == 0:
        return "không"
        
    chunks = []
    
    # Text components
    digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
    units = ["", "nghìn", "triệu", "tỷ"]
    
    num_str = str(int(n))
    # Pad to multiple of 3
    while len(num_str) % 3 != 0:
        num_str = "0" + num_str
        
    # Split into groups of 3
    groups = [num_str[i:i+3] for i in range(0, len(num_str), 3)]
    groups.reverse()
    
    def read_triple(triple, is_last_group):
        h, t, o = int(triple[0]), int(triple[1]), int(triple[2])
        if h == 0 and t == 0 and o == 0:
            return ""
            
        text = []
        
        # Hundreds
        if h > 0 or (len(chunks) > 0): # Read hundred if not top group
            text.append(digits[h])
            text.append("trăm")
            
        # Tens and Ones
        if t == 0 and o == 0:
            pass
        elif t == 0 and o > 0:
            text.append("lẻ")
            text.append(digits[o])
        elif t == 1:
            text.append("mười")
            if o == 1:
                text.append(" một") # "mười một" not "mười mốt"
            elif o == 5:
                text.append("lăm")
            elif o > 0:
                text.append(digits[o])
        elif t > 1:
            text.append(digits[t])
            text.append("mươi")
            if o == 1:
                text.append("mốt")
            elif o == 4:
                text.append("tư")
            elif o == 5:
                text.append("lăm")
            elif o > 0:
                text.append(digits[o])
                
        return " ".join(text)

    result_parts = []
    
    for i, group in enumerate(groups):
        triple_text = read_triple(group, i == len(groups) - 1)
        if triple_text:
            part = triple_text
            if i < len(units):
               part += " " + units[i]
            result_parts.append(part)
            
    result_parts.reverse()
    result = " ".join(result_parts)
    
    # Cleanup quirks
    result = result.strip()
    
    # Remove leading "lẻ" or "Lẻ" if present
    if result.lower().startswith("lẻ "):
        result = result[3:].strip()
        
    return result[0].upper() + result[1:]

def currency_to_vietnamese(amount):
    try:
        text = read_number(amount)
        return f"{text} đồng"
    except:
        return f"{amount} đồng"
