# Rà soát khả năng tiếp thu văn bản cốt truyện tiếng Việt

## 1. Mục tiêu và phạm vi

Đã rà toàn bộ **189 chuỗi văn bản cốt truyện** (`*.text`, gồm cả biến thể và ending) trong 12 gói tại `src/data/i18n/vi/`.

- Tập trung vào phần người chơi phải đọc để hiểu tình huống và ra quyết định.
- Không rà lại nhãn lựa chọn; phần đó đã có trong `Choice_Label_Clarity_Review.md`.
- Không tính UI thuần túy.
- Báo cáo này chỉ đề xuất nội dung. Chưa thay đổi các file localization gốc.

Mục tiêu không phải biến mọi câu thành văn bản chức năng khô cứng. Mục tiêu là để người chơi đọc lướt vẫn nắm được ba điều trong khoảng ba giây:

1. **Ai đang làm gì?**
2. **Việc đó liên quan gì đến mình?**
3. **Mình sắp phải quyết định điều gì?**

## 2. Kết luận nhanh

Phần lớn câu chữ hiện tại đúng ngữ pháp và có không khí tốt. Vấn đề là nhiều card đang dùng mật độ văn chương phù hợp với truyện ngắn hơn là game lựa chọn:

- Một câu chứa đồng thời bối cảnh, quan hệ, thủ tục, con số và hàm ý.
- Thông tin ảnh hưởng đến lựa chọn thường xuất hiện sau ẩn dụ hoặc mô tả không khí.
- Cùng một người/sự việc được gọi bằng nhiều cách, buộc người chơi phải nhớ và đối chiếu.
- Nhiều câu dùng danh từ hành chính như “cơ chế đặc thù”, “phạm vi rà soát”, “quy định chuyển tiếp” mà chưa nói ngay hệ quả cụ thể.
- Một số câu kết rất hay khi đọc chậm, nhưng lại cạnh tranh sự chú ý với thông tin gameplay.

Đề nghị áp dụng hai mức biên tập:

- **Mức A — nên sửa trực tiếp:** card có quyết định, điều kiện hoặc hệ quả dễ bị bỏ sót.
- **Mức B — nên rút gọn nhẹ:** nội dung đã rõ nhưng nhịp đọc còn nặng.
- **Giữ chất văn:** cao trào tai nạn, aftermath và ending có thể giàu hình ảnh hơn vì người chơi không cần xử lý nhiều luật chơi cùng lúc.

## 3. Quy chuẩn câu chữ đề xuất

### 3.1. Card quyết định

- Khoảng **35–55 từ**, ưu tiên 2–3 câu.
- Câu đầu: sự việc chính.
- Câu hai: hệ quả hoặc xung đột.
- Câu cuối: yêu cầu/quyết định, nếu chưa hiển nhiên từ nhãn lựa chọn.
- Mỗi câu chỉ nên có một ý chính.
- Chỉ giữ một câu hoặc hình ảnh đáng nhớ trên mỗi card.

### 3.2. Thuật ngữ và chủ thể

- Gọi thẳng vai trò đã biết: **Doanh Nhân**, **Người Đỡ Đầu**, **Bộ Trưởng**, **Nhà Cải Cách**, **Trợ Lý**.
- Hạn chế các cách gọi vòng như “người đàn ông ở buổi tiếp tân hôm nào”, “vị phó chủ nhiệm chuyên ký chung một nửa số phiếu”.
- Khi bắt buộc dùng thuật ngữ hành chính, giải thích ngay bằng hệ quả: “thoái vốn — bán hết cổ phần để hết xung đột lợi ích”.
- Đưa con số quan trọng sát đối tượng của nó; tránh bắt người chơi giữ nhiều con số trong trí nhớ rồi mới hiểu ý.

### 3.3. Đối thoại

- Nhân vật quyền lực vẫn có thể nói vòng, nhưng người kể phải làm rõ tình huống trước hoặc sau lời thoại.
- Giữ tối đa một câu hàm ý mạnh. Những câu còn lại nên nói thẳng.
- Tránh dùng cả dấu gạch ngang, chữ nghiêng, dấu ngoặc kép và câu ngắt cùng lúc nếu không thật cần thiết.

## 4. Mức A — các đề xuất nên áp dụng trực tiếp

### 4.1. `act0_act1.json`

#### `card.act0_mentor_advice.text`

**Vấn đề:** Ba lớp ẩn dụ liên tiếp làm lời khuyên chính bị loãng.

**Đề xuất:**

> “Cậu có trực giác tốt,” Người Đỡ Đầu nói. “Nhưng muốn thông qua cải cách, cậu cần phiếu. Hãy xây quan hệ trước. Khi vị thế đủ mạnh, người khác mới phải cân nhắc trước khi từ chối cậu.”

#### `card.act1_businessman_glimpse.text`

**Vấn đề:** Mất nhiều nhịp mới nhận ra Doanh Nhân đang nhắc người khác về một món nợ.

**Đề xuất:**

> Ở một buổi tiếp tân khác, bạn thấy Doanh Nhân nói chuyện với phó chủ nhiệm ủy ban ngân sách. “Việc tuần trước được duyệt rồi. Tôi sẽ không quên đâu.” Ông ta không nhìn bạn, nhưng thông điệp rất rõ: ông ta luôn ghi nhớ ai đã giúp mình.

#### `card.act1_business_permit.text`

**Vấn đề:** Quy trình giấy phép được kể qua nhiều mệnh đề; yêu cầu thật bị đặt ở cuối.

**Đề xuất:**

> “Giấy phép môi trường đã được duyệt, nhưng công ty phải nộp lại vì đổi biểu mẫu. Hồ sơ nằm yên năm tháng rồi,” Doanh Nhân nói. “Không phạm luật. Tôi chỉ cần cậu gọi để họ xử lý nó ngay.”

#### `card.act1_local_project.text`

**Vấn đề:** Câu cuối đẹp nhưng không nói thẳng cái giá của việc chen hàng.

**Đề xuất:**

> Hệ thống thoát nước trong khu vực đã vỡ hai lần trong tháng. Thẩm định bình thường mất cả mùa, nhưng ghế ủy ban cho phép bạn đưa dự án lên đầu danh sách. Một chữ ký sẽ cứu khu dân cư này sớm hơn — bằng cách đẩy các dự án khác xuống sau.

#### `card.act1_reformist_warning.text`

**Vấn đề:** Ý “tiền lệ xấu sẽ bị người sau lạm dụng” được diễn đạt quá vòng.

**Đề xuất:**

> Nhà Cải Cách đi bên cạnh bạn. “Anh làm việc rất hiệu quả. Nhưng mỗi lần anh bỏ qua quy trình, anh tạo ra một tiền lệ. Người kế nhiệm anh có thể dùng chính tiền lệ đó cho mục đích tệ hơn.”

### 4.2. `act2.json`

#### `card.act2_protected_investment.text`

**Vấn đề:** Cơ hội đầu tư, quan hệ trao đổi và mức lợi nhuận cùng chen trong một lượt thoại.

**Đề xuất:**

> “Tôi không quên chuyện giấy phép,” Doanh Nhân nói. Ông cho bạn mua sớm cổ phần của dự án chưa mở cho người ngoài. Bỏ 40.000 đô tối nay, bạn có thể thu về gấp ba vào mùa xuân.

#### `card.act2_housing_budget.text`

**Vấn đề:** Đối lập quan trọng bị bọc trong hình ảnh “ống kính yêu”.

**Đề xuất:**

> Ngân sách chỉ đủ cho một dự án: xây quần thể văn hóa dễ gây chú ý, hoặc sửa các khu nhà ở xã hội đang xuống cấp. Một bên đem lại hình ảnh. Bên kia giải quyết nhu cầu ít ai nhìn thấy.

#### `card.act2_business_audit.text`

**Vấn đề:** Câu “kỹ lưỡng hoặc công bằng” cố tình nhập nhằng nhưng chưa cho thấy Doanh Nhân đang xin can thiệp.

**Đề xuất:**

> Công ty của Doanh Nhân bị kiểm toán toàn diện. Tiền của bạn cũng đang nằm trong đó. Ông ta gọi và yêu cầu bạn can thiệp để thu hẹp cuộc kiểm toán, dù không nói thẳng thành lời.

#### `card.act2_wealth_disclosure.text`

**Vấn đề:** Thành ngữ “đúng câu chữ đang phải gánh nhiều” đòi hỏi diễn giải lại trong đầu.

**Đề xuất:**

> Trợ Lý đưa bạn bản kê khai tài sản. Luật bắt buộc khai lương và bất động sản, nhưng chưa ghi rõ danh mục đầu tư. Bạn có thể tự công khai cổ phần, hoặc lợi dụng khoảng trống đó để giữ kín.

#### `card.act2_mentor_protection.text`

**Vấn đề:** Nhiều lớp thời gian và đại từ khiến yêu cầu bị chậm.

**Đề xuất:**

> Một đơn khiếu nại cũ cáo buộc Người Đỡ Đầu sai phạm trong mua sắm công. Thứ Hai, ủy ban của bạn sẽ quyết định có mở lại hồ sơ hay không. Ông muốn bạn để vụ việc chìm xuống.

#### `card.act2_reformist_strong_bill.text`

**Vấn đề:** “Mọc răng” và “lối thoát hiểm” cùng xuất hiện, che phần dự luật thực sự thay đổi.

**Đề xuất:**

> Nhà Cải Cách đưa ra bản dự luật mạnh hơn: mọi hợp đồng và nhà thầu phụ đều phải công khai, kể cả dự án “chiến lược”. Bạn từng ủng hộ nguyên tắc này. Giờ nó không còn ngoại lệ để chính bạn sử dụng.

#### `card.act2_editor_regulatory_favor.text`

**Vấn đề:** Người chơi phải suy ra rằng Tổng Biên Tập muốn dừng cuộc rà soát giấy phép.

**Đề xuất:**

> Cơ quan quản lý đang rà soát giấy phép và cơ cấu sở hữu của tờ báo. Tổng Biên Tập muốn bạn gọi để làm nhẹ hoặc dừng cuộc rà soát. “Một cuộc gọi từ văn phòng cậu sẽ quyết định mọi chuyện.”

#### `card.act2_contractor_callback.text`

**Vấn đề:** “Câu hỏi có hạn sử dụng” hay nhưng chưa đủ rõ về nguy cơ sắp thành bê bối.

**Đề xuất:**

> Dự án bạn từng cho làm gấp đã đội vốn 40% và xuất hiện một nhà thầu phụ không rõ nguồn gốc. Chưa ai gọi đó là bê bối, nhưng báo chí đã bắt đầu hỏi. Bạn chỉ còn ít thời gian trước khi câu hỏi biến thành điều tra.

#### `card.act2_hospital_funding.text`

**Vấn đề:** Quá nhiều chi tiết nằm trong hai câu dài; quyết định chen hàng bị chìm.

**Đề xuất:**

> Một bệnh viện tỉnh đã xây xong nhưng phải chờ giấy phép suốt 11 tháng. Trong lúc đó, bệnh nhân vẫn phải đi thêm hai giờ để chữa trị. Bạn có thể ký cho bệnh viện được xét trước — và đẩy một hồ sơ khác xuống sau.

#### `card.act2_second_promotion.text`

**Vấn đề:** Người chơi phải ghép ba dấu hiệu mới hiểu rằng mình đã được thăng chức mà không được hỏi.

**Đề xuất:**

> Thông cáo mới ghi tên bạn ở vị trí cao hơn. Bạn được chuyển sang văn phòng nhìn ra sông, còn lịch làm việc lập tức kín các cuộc họp cấp cao. Không ai hỏi bạn có nhận chức hay không. Quyết định đã được đưa ra thay bạn.

#### `card.act2_businessman_headline.text`

**Vấn đề:** Đây là ví dụ rõ nhất của chủ thể gián tiếp, câu chen dài và thông tin chính xuất hiện muộn.

**Đề xuất:**

> Doanh Nhân bạn gặp ở buổi tiếp tân vừa thắng gói thầu logistics cảng. Hợp đồng này còn lớn hơn ngân sách cả năm của ủy ban bạn. Tờ báo gọi ông ta là “đối tác giúp nhà nước hành động nhanh hơn.”

### 4.3. `act3.json`

#### `card.act3_editor_exclusive.text`

**Vấn đề:** Lợi ích của độc quyền tin tức bị kéo qua bốn vế.

**Đề xuất:**

> Tổng Biên Tập muốn độc quyền buổi công bố tuần sau. Đổi lại, ông sẽ cho bạn trang nhất, bài viết tiếp theo và một xã luận ca ngợi năng lực lãnh đạo. Nếu gửi tin cho mọi báo, nó chỉ là một bản tin thông thường.

#### `card.act3_protected_contract.text`

**Vấn đề:** Tiến độ, đấu thầu, đối thủ và xung đột lợi ích xuất hiện cùng lúc.

**Đề xuất:**

> Doanh Nhân muốn được chỉ định thẳng cho gói thầu hành lang phía Đông. Đấu thầu công khai sẽ chậm thêm tám tháng; chỉ định thầu có thể khởi công ngay năm nay. Công ty của ông ta sẽ hưởng lợi — và số cổ phần bạn đang giữ cũng vậy.

#### `card.act3_aide_concern.text`

**Vấn đề:** Danh sách rủi ro rất quan trọng nhưng bị diễn đạt như một lời thú nhận văn chương.

**Đề xuất:**

> Trợ Lý đã ghi lại mọi việc bạn có thể phải giải trình: cổ phần, hợp đồng không đấu thầu và các cuộc bổ nhiệm. Danh sách ngày càng dài. “Nếu sau này có điều tra, tôi là người duy nhất còn giữ toàn bộ dấu vết.”

#### `card.act3_reformist_confrontation.text`

**Vấn đề:** Lời đe dọa chính trị bị lặp ý.

**Đề xuất:**

> Trước micro, Nhà Cải Cách nhắc lại lời bạn từng nói: luật lệ vẫn quan trọng dù gây bất tiện. “Từ nay, mỗi lần anh đi ngược lời đó, tôi sẽ nhắc lại trước nghị trường.”

#### `card.act3_leak_clean.text`

**Vấn đề:** “Không có gì dày” không tự nhiên và làm yếu thông tin rằng hồ sơ sạch.

**Đề xuất:**

> Một phóng viên đã có bản kê khai tài sản và danh sách các hồ sơ bạn từng đẩy nhanh. Phần lớn thông tin đã được bạn công khai, nên bài báo không có phát hiện lớn. Họ vẫn sẽ đăng. Trợ Lý hỏi bạn muốn phản hồi thế nào.

#### `card.act3_leak_captured.text`

**Vấn đề:** Cấu trúc hai tòa soạn, hai tiêu đề và hai cuộc gọi khiến ý chính khó bắt nhanh.

**Đề xuất:**

> Có người đang bán hồ sơ đầu tư của bạn cho hai tòa soạn. Tổng Biên Tập kiểm soát một trong hai và có thể dập bài hoặc đổi tiêu đề. Ông đặt hai bản nháp trước mặt bạn: một bản bảo vệ, một bản buộc tội.

#### `card.act3_suppression_escalation.text`

**Vấn đề:** Chi tiết hay nhưng quá nhiều trước khi nói rõ cái giá là món nợ.

**Đề xuất:**

> Tổng Biên Tập đã dập bài và điều phóng viên sang mảng khác. Bạn không mất đồng nào, nhưng giờ ông ta đã chứng minh rằng mình có thể xóa một câu chuyện cho bạn. Món nợ ấy mới là cái giá.

#### `card.act3_popular_policy.text`

**Vấn đề:** Cơ chế “giữ dự luật làm con tin” cần nói thẳng hơn.

**Đề xuất:**

> Đa số ủng hộ chương trình bữa ăn học đường, nhưng hai chủ nhiệm ủy ban không cho đưa ra biểu quyết. Họ muốn đổi lá phiếu lấy một vụ bổ nhiệm khác. Bạn có thể đáp ứng yêu cầu để dự luật được thông qua.

#### `card.act3_authority_vote.text`

**Vấn đề:** Luật chơi của cơ quan độc lập bị chia cắt bởi ẩn dụ chiếc chìa khóa.

**Đề xuất:**

> Dự luật độc lập điều tra được đưa ra biểu quyết. Nếu thông qua, điều tra viên có nhiệm kỳ cố định và chỉ tòa án mới được bãi nhiệm. Không văn phòng nào còn quyền can thiệp vào điều tra — kể cả văn phòng của bạn.

#### `card.act3_public_poll.text`

**Vấn đề:** Nguồn khảo sát và nghi vấn thiên vị mất nhiều nhịp mới rõ.

**Đề xuất:**

> Khảo sát của đảng cho bạn 61% ủng hộ, nhưng người phụ trách khảo sát do chính bạn bổ nhiệm. Một khảo sát độc lập tốn 8.000 đô và có thể cho kết quả xấu hơn. Trợ Lý hỏi bạn có muốn biết con số thật không.

#### `card.act3_wealth_spike.text`

**Vấn đề:** Hai phương án tài chính và hàm ý rửa giao dịch bị trộn trong lời thoại.

**Đề xuất:**

> Cổ phần dự án hành lang của bạn có thể tăng gấp bốn vào cuối năm. Doanh Nhân cũng đề nghị tìm người mua lại ngay với giá cao để giao dịch kín đáo hơn. Bạn có thể giữ cổ phần và chờ lợi nhuận, hoặc bán để giảm dấu vết.

#### `card.act3_audit_scandal_return.text`

**Vấn đề:** Dấu vết trách nhiệm của người chơi bị chôn sau mô tả tài liệu.

**Đề xuất:**

> Một tờ trình bị rò rỉ cho thấy cuộc kiểm toán năm trước đã bị thu hẹp và không được chuyển sang điều tra. Hồ sơ mang con dấu của văn phòng bạn. Chiều nay báo chí sẽ hỏi ai đã ra lệnh.

#### `card.act3_gathering_unavoidable.text`

**Vấn đề:** Cấu trúc đối xứng có không khí nhưng làm chậm thông tin rằng người chơi đã bị ép tham dự.

**Đề xuất:**

> Bạn từng từ chối buổi tối riêng, nên nó quay lại dưới tên “bữa tối công tác về điều phối vùng”. Vẫn địa điểm và những người đó, nhưng lần này ba văn phòng đã phê duyệt. Lịch của bạn được chốt trước khi Trợ Lý kịp hỏi.

### 4.4. `gathering.json`

#### `card.gathering_arrival.text`

**Vấn đề:** Mở cảnh tốt nhưng danh sách bốn nhân vật và ẩn dụ mạng lưới làm người chơi mệt trước chuỗi quyết định dài.

**Đề xuất:**

> Ngôi nhà không xuất hiện trên bản đồ. Bên trong, Người Đỡ Đầu, Doanh Nhân, Tổng Biên Tập và Bộ Trưởng đang ngồi cùng một bàn. Những mối quan hệ riêng lẻ của bạn đã thành một mạng lưới. Ngoài cửa, tài xế hỏi bạn sẽ về bằng cách nào.

#### `card.gathering_strategic_project.text`

**Vấn đề:** Không nói thẳng rằng nhóm muốn né đấu thầu.

**Đề xuất:**

> Bộ Trưởng và Doanh Nhân đã chuẩn bị sẵn kế hoạch cho giai đoạn cuối của dự án hành lang. Họ muốn dùng cơ chế đặc biệt để giao thẳng dự án cho một nhà thầu và khởi công trước mùa xuân. Phương án còn lại là đấu thầu công khai nhưng chậm hơn.

#### `card.gathering_investment_conflict.text`

**Vấn đề:** Thông tin quyết định rất rõ nhưng bị lặp và kéo dài.

**Đề xuất:**

> Trợ Lý nhắn rằng bạn đang sở hữu cổ phần trong chính dự án hành lang. Bán hết tối nay sẽ lỗ lớn nhưng chấm dứt xung đột lợi ích. Giữ lại sẽ giúp bạn kiếm nhiều tiền nếu dự án được duyệt. Mọi người trong phòng đều biết điều đó.

#### `card.gathering_transport_drunk.text`

**Vấn đề:** Chất thơ làm mờ sự thật đơn giản: bạn say, có chìa khóa và phải chọn cách về.

**Đề xuất:**

> Bạn bước xuống bậc thang và nhận ra mình đã say. Ai đó đưa lại chìa khóa xe trên đường ra cửa. Nhà cách hai mươi phút; bạn phải chọn tự lái hoặc gọi tài xế.

### 4.5. `dilemmas.json`

Các card này cần giữ thế khó đạo đức, nhưng không nên khiến **việc hiểu tình huống** trở thành một phần của độ khó. Sự mơ hồ nên nằm ở hậu quả, không nằm ở câu chữ.

#### Chuỗi `card.dil_queue_*`

**`card.dil_queue_setup.text` — đề xuất:**

> Cha của một cử tri cần can thiệp tim nhưng đang đứng thứ 14 trong danh sách chờ. Trợ Lý nói giám đốc bệnh viện sẽ xếp ông lên trước nếu nhận cuộc gọi từ bạn. Làm vậy đồng nghĩa một bệnh nhân khác phải chờ lâu hơn.

**`card.dil_queue_decision.text` — đề xuất:**

> Nếu bạn gọi, người cha sẽ được điều trị tháng sau và bệnh viện sẽ không ghi lại việc chen hàng. Nếu không gọi, ông tiếp tục chờ theo thứ tự. Người bị đẩy xuống sẽ không bao giờ biết vì sao.

**`card.dil_queue_callback.text.v_called` — đề xuất:**

> Người cha đang hồi phục. Nhưng bệnh viện giờ gửi thêm ba cái tên và hỏi liệu họ có được “sắp xếp như lần trước” không. Cuộc gọi của bạn đã trở thành một tiền lệ mà người khác muốn sử dụng.

#### Chuỗi `card.dil_witness_*`

**`card.dil_witness_complication.text` — đề xuất:**

> Ba công chức đã bí mật cung cấp tài liệu, nhưng tên họ vẫn còn trong bìa hồ sơ, dữ liệu file và một email. Có thể che tên để bảo vệ họ, nhưng không kịp trước lịch đăng sáng mai.

**`card.dil_witness_decision.text` — đề xuất:**

> Đăng ngay sẽ phá đường dây bổ nhiệm, nhưng có thể làm lộ ba nhân chứng. Hoãn 30 ngày sẽ có thời gian bảo vệ họ, đổi lại bạn phải chịu một tháng bị cáo buộc ém hồ sơ. Quyết định cuối cùng mang tên bạn.

**`card.dil_witness_aftermath.text.v_sealed_safe` — đề xuất:**

> Sau 30 ngày, cả ba nhân chứng đã được bảo vệ. Hồ sơ được công bố nguyên vẹn vào ngày 32, tên đã che và đường dây bị triệt phá. Những cáo buộc bạn ém chuyện nhanh chóng biến mất.

**`card.dil_witness_aftermath.text.v_published_exposed` — đề xuất:**

> Hồ sơ công khai đã phá đường dây, nhưng một nhân chứng bị điều chuyển và người khác rút lại lời khai. Điều Tra Viên cảnh báo: lần sau, sẽ ít người dám mang bằng chứng đến hơn.

#### Chuỗi `card.dil_reform_*`

**`card.dil_reform_setup.text` — đề xuất:**

> Cải cách mới yêu cầu tuyển dụng cạnh tranh và công khai tiêu chí. Vấn đề còn lại là có xét lại các trường hợp đã tuyển hay không. Trong ba năm qua, thủ tục đặc biệt đã đưa người nhà Bộ Trưởng vào biên chế — nhưng cũng giúp tuyển gấp bác sĩ và giáo viên giữa trận lụt.

**`card.dil_reform_decision.text` — đề xuất:**

> Áp dụng hồi tố sẽ loại được các trường hợp ưu ái, nhưng bác sĩ và giáo viên tuyển khẩn cấp cũng phải thi lại, khiến nhiều nơi thiếu người. Chỉ áp dụng từ nay sẽ giữ hệ thống ổn định, nhưng những người được ưu ái vẫn giữ chức.

**`card.dil_reform_callback.text.v_retroactive` — đề xuất:**

> Bệnh viện huyện mất 11 nhân viên vì phải thi lại, trong khi kỳ tuyển mới cần bốn tháng. Một giáo viên được tuyển giữa tuần lũ cũng bị rà soát dù không có quan hệ với Bộ Trưởng. Quy định đã xử lý mọi người như nhau — và đó chính là vấn đề.

**`card.dil_reform_callback.text.v_transition` — đề xuất:**

> Trong sáu tuần chuyển tiếp, các bộ đã tuyển thêm 41 người theo diện “đặc biệt” trước khi cửa đóng. Hai trường hợp đã lên báo. Họ lợi dụng đúng khoảng chuyển tiếp mà bạn cho phép.

#### Chuỗi `card.dil_clinics_*`

**`card.dil_clinics_setup.text` — đề xuất:**

> Kiểm toán phát hiện ba công ty trung gian trích tiền từ hợp đồng y tế của Bộ Trưởng. Bằng chứng đủ để đóng băng tài khoản ngay. Nhưng các công ty này cũng đang trả lương và mua thuốc cho 31 phòng khám; một số nơi sẽ phải đóng cửa cuối tuần này.

**`card.dil_clinics_decision.text` — đề xuất:**

> Đóng băng ngay sẽ giữ nguyên bằng chứng nhưng khiến phòng khám thiếu tiền. Cho hoạt động thêm 90 ngày dưới giám sát sẽ bảo vệ bệnh nhân, nhưng Bộ Trưởng có thời gian xóa dấu vết. Dù chọn gì, ông ta cũng biết bạn đứng sau quyết định.

**`card.dil_clinics_callback.text.v_suspended_retaliation` — đề xuất:**

> Hồ sơ được bảo toàn, nhưng hai phòng khám đã đóng cửa. Bộ Trưởng trả đũa bằng cách đưa cho báo chí danh sách những ngoại lệ văn phòng bạn từng ký. Một số trường hợp là thật. Ông ta đang biến cuộc kiểm toán thành câu chuyện về bạn.

**`card.dil_clinics_callback.text.v_supervised_kept` — đề xuất:**

> Sau 90 ngày, 29 phòng khám vẫn mở. Nhóm giám sát độc lập đã sao chép sổ sách từ ngày thứ hai, trước khi bản gốc bị “hợp nhất” vào ngày 40. Vụ án vẫn đứng vững, nhưng Bộ Trưởng không còn nghe điện thoại của bạn.

**`card.dil_clinics_callback.text.v_supervised_lost` — đề xuất:**

> Sau 90 ngày, 29 phòng khám vẫn mở. Nhưng Bộ Trưởng tự kiểm soát việc giám sát và “hợp nhất” lịch thanh toán đến mức không còn chứng minh được ai nhận tiền. Bệnh nhân được chữa trị; vụ án mất người để truy tố.

#### Chuỗi `card.dil_privacy_*`

**`card.dil_privacy_setup.text.v_controlled` — đề xuất:**

> Nhà Báo có toàn bộ hồ sơ vụ tai nạn: lịch gọi, email phối hợp và cả thông tin riêng của nạn nhân. Đăng hết ngay sẽ ngăn người khác xóa bằng chứng nhưng làm lộ địa chỉ, bệnh án và ảnh cá nhân. Nếu tách phần riêng tư để niêm phong, hồ sơ phải giao cho điều tra viên do Bộ Trưởng bổ nhiệm.

**`card.dil_privacy_decision.text` — đề xuất:**

> Gia đình đồng ý công khai mọi bằng chứng liên quan đến vụ án. Họ chỉ xin niêm phong bệnh án, ảnh cá nhân và lời khai của em gái nạn nhân. Làm vậy bảo vệ cô ấy, nhưng bạn phải tin cơ quan giữ phần hồ sơ bị niêm phong.

**`card.dil_privacy_consequence.text.v_sealed_lost` — đề xuất:**

> Phần riêng tư được giữ kín, nhưng điều tra viên của Bộ Trưởng cũng làm thất lạc các email phối hợp nằm chung hộp hồ sơ. Gia đình giữ được sự riêng tư. Vụ án mất bằng chứng cốt lõi.

**`card.dil_privacy_consequence.text.v_public` — đề xuất:**

> Toàn bộ hồ sơ được công khai. Đến tối, người lạ đã tìm đến địa chỉ nhà nạn nhân và chụp ảnh con phố. Bằng chứng không thể bị xóa nữa, nhưng đời tư của cô ấy cũng không thể lấy lại.

### 4.6. `replay.json` và `promises.json`

#### `card.act0_inherited_staff.text`

**Đề xuất:**

> Bạn thừa hưởng cả đội ngũ của Người Đỡ Đầu: chánh văn phòng, hai thư ký và một tài xế giàu kinh nghiệm. Họ làm việc tốt, nhưng lòng trung thành vẫn thuộc về ông ấy. Giữ họ giúp văn phòng chạy ngay; thay người sẽ mất một tuần.

#### `card.act0_ministry_photo.text`

**Đề xuất:**

> Cán Bộ Báo Chí chỉ cho bạn chọn một ảnh đại diện cho nhiệm kỳ. Ảnh ở bộ với Người Đỡ Đầu cho thấy bạn có hậu thuẫn. Ảnh tại quận ngập cho thấy bạn đứng về phía cử tri. Cả hai đều thật, nhưng chỉ một hình được đăng.

#### `card.act0_briefing_binder.text`

**Đề xuất:**

> Hồ sơ bàn giao dài 400 trang, gồm hợp đồng, kiểm toán chưa xong và nhiều “điểm nhạy cảm”. Trợ Lý đã tóm tắt thành chín trang. Bản ngắn giúp bạn qua buổi hỏi đáp; bản đầy đủ chứa những việc sau này bạn vẫn phải chịu trách nhiệm.

#### `card.act0_predecessor_call.text`

**Đề xuất:**

> Người tiền nhiệm mời bạn ăn tối để giải thích mạng lưới trong văn phòng: ai nợ ai và cánh cửa nào thật sự mở. Ông nói sớm muộn bạn cũng biết, nhưng nhận lời sẽ giúp bạn có thông tin ngay từ đầu.

#### `card.act2_housing_budget.text.v_fasttrack`

**Đề xuất:**

> Ngân sách chỉ đủ xây khu văn hóa nổi bật hoặc sửa nhà ở xã hội. Năm ngoái bạn đã đẩy nhanh dự án thoát nước vì người dân không thể chờ. Lần này, dự án dễ lên hình lại là dự án đang gây áp lực lớn hơn.

#### `card.act_echo_inaugural.text`

**Đề xuất:**

> Một năm sau, bạn lại phát biểu ở cùng nghị trường. Văn phòng đã soạn sẵn bài nói, nhưng giữa bài có một câu trái ngược với lời bạn từng tuyên bố trong tuần đầu. Không ai trong phòng nhớ. Bạn thì nhớ.

#### `card.act3_authority_vote_betrayal.text`

**Đề xuất:**

> Dự luật đang chờ lá phiếu của bạn. Chủ động bỏ phiếu chống khác với việc im lặng để nó thất bại, nhưng kết quả vẫn giống nhau. Chỉ bạn biết mình đã phản bội lời hứa bằng cách nào.

### 4.7. `public_trust.json` và `standing_power.json`

#### `card.trust_polling_bubble.text`

**Đề xuất:**

> Khảo sát công khai nói bạn được yêu mến, nhưng số đơn khiếu nại, hội trường trống và phỏng vấn riêng lại cho kết quả ngược lại. Bạn có thể trả tiền để đo lại trung thực, hoặc công bố con số đẹp trước khi nguồn dữ liệu bị chất vấn.

#### `card.trust_coercive_stability.text`

**Đề xuất:**

> Các địa phương nhận lệnh nhưng không thực hiện. Người dân từ chối gặp, nhân chứng im lặng và tình nguyện viên bỏ đi. Bạn vẫn đủ quyền lực để che giấu sự chống đối, hoặc có thể thừa nhận nguyên nhân và tìm cách sửa.

#### `card.trust_abandoned_office.text`

**Đề xuất:**

> Phòng tiếp dân vắng cả nhân viên lẫn người dân. Đại Diện Gia Đình nói không ai còn tin văn phòng sẽ giúp họ. Những vụ khó bị bỏ lại, còn các tay môi giới đề nghị dùng tiền và quan hệ để khiến văn phòng trông có quyền lực trở lại.

#### `card.sp_private_capital_council.text`

**Đề xuất:**

> Doanh Nhân mời bạn vào một hội đồng kín gồm những người có thể làm thị trường biến động bằng một cuộc gọi. Danh tiếng của bạn giờ đủ để tham gia. Nếu nhận lời, khoản phí cố vấn đầu tiên sẽ được trả ngay tối nay.

#### `card.sp_figurehead.text`

**Đề xuất:**

> Công chúng chú ý đến bạn, nhưng các chủ nhiệm ủy ban không làm theo chỉ đạo. Bạn có thể tốn tiền xây lại bộ máy bỏ phiếu từ địa phương và chấp nhận giảm danh tiếng. Hoặc tiếp tục làm gương mặt đại diện để người khác quyết định chính sách.

#### `card.sp_marginal_officeholder.text`

**Đề xuất:**

> Văn phòng gần như không còn việc quan trọng. Trên bàn chỉ có hai lựa chọn: giải quyết 20 vụ địa phương không đem lại lợi ích chính trị, hoặc bán những lối tắt nhỏ cho doanh nghiệp đang sẵn sàng trả tiền.

### 4.8. `incident_aftermath.json`

Ở chương này có thể giữ nhịp văn chương cao hơn, nhưng các card trực tiếp dẫn đến quyết định vẫn cần rõ chủ thể và hậu quả.

#### `card.incident_emergency_b.text`

**Đề xuất:**

> Bệnh viện cần văn phòng bạn phê chuẩn chuyển viện khẩn cấp cho nạn nhân. Ê-kíp phẫu thuật đang chờ giấy tờ. Bạn có thể cứu thời gian cho cô ấy trước khi xử lý những hậu quả chính trị khác.

#### `card.incident_explicit_request_b.text`

**Đề xuất:**

> Bộ Trưởng nhắc rằng Người Đỡ Đầu đã phục vụ đất nước 30 năm và một phiên tòa sẽ kéo theo cả mạng lưới. Rồi ông nói thẳng: ông muốn bạn giúp thu xếp để Người Đỡ Đầu tránh bị truy tố.

#### `card.aftermath_investigator_independent.text`

**Đề xuất:**

> Điều Tra Viên độc lập đến lấy lời khai. Bạn không bổ nhiệm cô ấy và văn phòng bạn không có quyền can thiệp vào cuộc điều tra. Cô chỉ thông báo vì phép lịch sự — rồi bắt đầu hỏi bạn.

#### `card.aftermath_records.text`

**Đề xuất:**

> Điều tra viên yêu cầu lịch làm việc, nhật ký cuộc gọi và danh sách khách dự tiệc. Trợ Lý không nhắc đến bản danh sách cũ đang nằm trong ngăn kéo. Cả hai đều biết nó cũng thuộc phạm vi yêu cầu.

#### `card.aftermath_compensation.text`

**Đề xuất:**

> Gia đình cần tiền cho phẫu thuật và những ngày công đã mất. Luật sư của họ chưa hỏi ai cầm lái; ông chỉ muốn biết ai đã gọi xe cấp cứu. Câu trả lời sẽ cho thấy ai đã ở đó và đã làm gì.

#### `card.aftermath_network_covered.text`

**Đề xuất:**

> Cả mạng lưới đồng loạt bảo vệ bạn. Doanh Nhân hứa giữ mọi việc ổn định; Tổng Biên Tập đăng xã luận ca ngợi cách bạn xử lý khủng hoảng. Sự giúp đỡ rất ấm áp — và cũng cho thấy mọi người đã phối hợp với nhau.

#### `card.aftermath_media_captured.text`

**Đề xuất:**

> Tổng Biên Tập có thể khiến tin về vụ việc biến mất khỏi bốn tòa soạn và hai nền tảng trước thứ Sáu. Mạng lưới kiểm soát truyền thông này được xây từ những ân huệ trước đây của bạn. Giờ bạn chỉ cần quyết định có sử dụng nó hay không.

#### `card.aftermath_institution_b.text`

**Đề xuất:**

> Hồ sơ sẽ được chuyển đến viện kiểm sát trước thứ Hai. Văn phòng bạn vẫn đủ quyền lực để chặn nó trước khi tới nơi. Quyết định cuối cùng là để quy trình tiếp tục hay can thiệp lần nữa.

## 5. Mức B — nên rút gọn nhẹ, chưa cần viết lại toàn bộ

Các key dưới đây đã truyền đạt được tình huống. Khi triển khai, chỉ cần cắt 10–25% số chữ và đưa hệ quả lên sớm hơn:

### `act0_act1.json`

- `card.act0_appointment_day.text`: bỏ “tay đặt lên vai bạn”; đi thẳng vào kỳ vọng sau tuyên thệ.
- `card.act0_constituent_land_case.text`: giữ ba mức đền bù và câu hỏi “con số nào là thật”; có thể bỏ một lần lặp “khác nhau”.
- `card.act0_first_parliament_speech.text`: tách hai bản thảo thành hai câu ngắn.
- `card.act1_businessman_intro.text`: gọi thẳng **Doanh Nhân**, tránh mô tả vest hai lần trong cùng tuyến truyện.
- `card.act1_constituent_case_callback.text`: đưa kết luận “hai chữ ký không khớp” lên trước phần độ dày hồ sơ.
- `card.act1_editor_profile_offer.text`: giữ câu “tôi chọn câu hỏi”, giảm mô tả mùi phòng làm việc.

### `act2.json`

- `card.act2_investment_growth.text`: “40.000 đã sinh thêm 180.000” là ý chính; bỏ nhịp “cân nhắc từng chữ”.
- `card.act2_popularity_event.text`: đổi “gương mặt của bạn thì đang sẵn” thành “đảng muốn bạn làm gương mặt chiến dịch”.
- `card.act2_investigation_independence.text`: giữ ba luật rõ ràng — nhiệm kỳ cố định, chỉ tòa án bãi nhiệm, văn phòng bạn không can thiệp.
- `card.act2_audit_result_managed.text`: rút phần đọc báo cáo; giữ kết quả, phản ứng thị trường và lời “Hiệu quả thật.”

### `act3.json`

- `card.act3_protest.text`: đưa yêu cầu của an ninh và báo chí lên ngay sau thông tin đám đông.
- `card.act3_reformist_cooperation.text`: thay “mỗi người mới nợ một ai đó điều gì đó” bằng “mỗi tháng chậm trễ tạo thêm một cuộc bổ nhiệm có ràng buộc”.
- `card.act3_minister_relative.text`: dùng một lần “có năng lực nhưng là người nhà Bộ Trưởng”; bỏ lặp “có”.
- `card.act3_constituent_return_helped.text`: gọi thẳng “gia đình có ba mức đền bù” ở câu đầu.
- `card.act3_constituent_return_ignored.text`: bỏ “một cái tên bạn gần như đã quên”; bắt đầu bằng việc gia đình chặn bạn ở sảnh.
- `card.act3_minister_media_help.text`: nói rõ Bộ Trưởng muốn bạn dùng quan hệ với tòa báo để chặn bài.
- `card.act3_reformist_farewell_ally.text`: giữ câu “hãy để quy trình đứng vững”; cắt phần giải thích lặp sau đó.
- `card.act3_reformist_farewell_opposition.text`: giữ ý “từ nay tôi sẽ bỏ phiếu chống”; rút bớt triết luận ở cuối.

### `dilemmas.json`

- `card.dil_queue_callback.text`: giữ kết quả điều trị và cảm giác của gia đình; bỏ thao tác “Trợ Lý lưu hồ sơ”.
- `card.dil_witness_aftermath.text.v_sealed_lost`: nói thẳng hai phụ lục thanh toán đã bị lấy khỏi hồ sơ trong thời gian niêm phong.
- `card.dil_witness_aftermath.text.v_published_safe`: thay “các cơ quan ấy đến được họ” bằng “trước khi cấp trên kịp trả đũa”.
- `card.dil_clinics_callback.text.v_suspended`: đổi câu chơi chữ về “thì của động từ” thành một mốc rõ: chưa biết khi nào tiền khẩn cấp tới.
- `card.dil_privacy_consequence.text.v_sealed_kept`: rút danh sách bằng chứng đã đăng vì setup vừa nêu chúng.

### `replay.json`, `public_trust.json`, `standing_power.json`

- `card.act0_first_petition.text`: rút số lượng người; giữ xung đột giữa đoàn cử tri và bữa sáng quyết định ghế ủy ban.
- `card.act0_private_dinner_invitation.text.v_independent`: nói rõ bữa tối thử thách lời hứa độc lập.
- `card.act1_committee_opportunity.text.v_promised`: đưa quan hệ “chiếc ghế giúp thực hiện lời hứa” lên trước.
- `card.act2_second_promotion.text.v_by_minister`: nói thẳng Bộ Trưởng đã sắp xếp việc thăng chức dù bạn không nhớ từng đồng ý.
- `card.trust_quiet_reservoir.text`: thay “số liệu toàn quốc sai” bằng “khảo sát đã bỏ sót những khu vực này”.
- `card.trust_beloved_figurehead.text`: giải thích “mượn bộ máy” là nhận hỗ trợ từ liên minh và mắc nợ họ.
- `card.sp_regional_coalition_invitation.text`: nói thẳng liên minh đổi đội vận động lấy lá phiếu ngân sách sau này.
- `card.sp_kingmaker.text`: rút “tên tuổi và bộ máy”; giữ việc không phe nào lập chính phủ nếu thiếu bạn.

### `incident_aftermath.json`

- `card.incident_leave.text` và `card.incident_call_b.text`: thay cụm “chất giọng chỉ dành cho những chuyện hệ trọng” bằng lời báo trực tiếp.
- `card.aftermath_first_article_captured.text`: nói rõ Tổng Biên Tập đang chờ lệnh dập hoặc sửa bài.
- `card.aftermath_reformist_plea.text`: giữ đối lập “không thể sửa, nhưng có thể ngừng làm tệ hơn”; bỏ câu lặp cuối.
- `card.aftermath_aide_substitute.text`: nói rõ Trợ Lý đang thay người trước đây từng ngăn bạn tiếp tục che đậy.
- `card.aftermath_institution_a.text`: nếu đây là card quyết định, cần nêu lá thư làm gì; hình ảnh “tòa nhà vẫn là tòa nhà” hiện quá trừu tượng.

## 6. Những đoạn nên giữ chất văn

Không nên áp quy chuẩn 35–55 từ một cách máy móc cho mọi đoạn. Các phần sau đang dùng chất văn đúng chỗ vì chúng là cao trào, dư âm hoặc kết luận, không phải nơi truyền đạt luật chơi mới:

- `card.incident_collision.text`
- `card.incident_immediate_choice.text`
- `card.incident_stay.text`
- `card.aftermath_responsibility_a.text`
- `card.aftermath_media_clean.text`
- `card.aftermath_intervention_failed.text`
- Toàn bộ nhóm `ending.*`, đặc biệt:
  - `ending.ending_break_the_chain.text`
  - `ending.ending_accountability.text`
  - `ending.ending_too_late.text`
  - `ending.ending_protected.text`
  - `ending.ending_untouchable.text`
  - `ending.ending_collapse.text`
  - `ending.ending_scapegoat.text`

Tuy vậy, ending vẫn nên được kiểm tra hiển thị thành các đoạn ngắn. Văn hay không đồng nghĩa với việc phải xuất hiện thành một khối chữ lớn.

## 7. Quy tắc kiểm tra sau khi sửa

Mỗi card nên qua bốn phép thử:

1. **Đọc lướt:** che hai phần ba cuối card; câu đầu có cho biết sự việc chính không?
2. **Nhắc lại:** sau một lần đọc, người thử có nói được hai lựa chọn và cái giá của mỗi lựa chọn không?
3. **Bỏ tên riêng:** các đại từ như “ông ấy”, “họ”, “nó” còn chỉ về đúng một đối tượng không?
4. **So với hiệu ứng:** nội dung có báo đúng loại hậu quả mà dữ liệu card thực sự áp dụng không, dù không cần lộ con số?

## 8. Thứ tự triển khai đề xuất

1. Sửa toàn bộ **Mức A** ở `act2.json`, `act3.json`, `gathering.json` trước; đây là nơi hệ thống quan hệ và tiền bạc dày nhất.
2. Sửa bốn chuỗi trong `dilemmas.json` theo cùng một cấu trúc **setup → hai cái giá → outcome**.
3. Sửa các biến thể trong `replay.json` và `promises.json`, bảo đảm bản thường và bản hồi tưởng có cùng độ rõ.
4. Rút gọn nhẹ **Mức B**.
5. Chạy một lượt trong game ở kích thước màn hình nhỏ nhất, kiểm tra số dòng và thời gian đọc thực tế; không chỉ kiểm tra JSON.

Kết quả mong muốn: người chơi vẫn cảm thấy thế giới chính trị có tầng nghĩa, nhưng không phải giải mã câu văn trước khi được cân nhắc lựa chọn.
