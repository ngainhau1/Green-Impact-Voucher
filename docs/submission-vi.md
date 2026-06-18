# Green Impact Voucher - Bản Pitch Tiếng Việt

## Tóm tắt

Green Impact Voucher là một ứng dụng tài chính xanh trên Stellar, giúp quán cà phê, cửa hàng, sự kiện và doanh nghiệp nhỏ biến mỗi khoản thanh toán của khách hàng thành một voucher tác động môi trường có thể kiểm chứng. Tiền của khách hàng không chuyển thẳng cho dự án, mà đi vào vault của smart contract và chỉ được giải ngân sau khi tác động được xác minh.

## Vấn đề cụ thể

Các doanh nghiệp nhỏ muốn cho khách hàng đóng góp vào dự án xanh ngay tại lúc thanh toán, ví dụ tài trợ điện mặt trời cho trường học. Tuy nhiên cách làm hiện nay thường là hộp quyên góp, QR chuyển khoản hoặc lời cam kết trên mạng xã hội.

Khách hàng không biết tiền của mình có thật sự đến dự án hay không. Doanh nghiệp khó chứng minh chiến dịch ESG/CSR với cộng đồng. Chủ dự án xanh thiếu một cơ chế minh bạch, chi phí thấp để chứng minh rằng tác động đã được tạo ra trước khi nhận tiền.

## Giải pháp

Green Impact Voucher tạo một luồng green checkout minh bạch:

1. Merchant hoặc chủ dự án tạo campaign, ví dụ `Da Nang Solar Classroom`.
2. Khách hàng mua voucher xanh khi thanh toán.
3. Mỗi voucher có giá `0.10 XLM` và đại diện cho `10 kWh of verified solar energy`.
4. Smart contract chuyển tiền vào vault.
5. Khách hàng nhận Impact Receipt với voucher ID, campaign, impact unit, số tiền và transaction proof.
6. Admin hoặc project owner xác minh tác động bằng report hash.
7. Khách hàng retire voucher để ghi nhận tác động đã tài trợ.
8. Project owner chỉ được rút tiền sau khi tác động đã được xác minh.

## Vì sao là financial application

Dự án không chỉ là dashboard môi trường. Đây là ứng dụng tài chính hướng người dùng vì có thanh toán, lưu ký tiền trong vault, điều kiện giải ngân, receipt giao dịch, và bằng chứng on-chain.

- Customer: mua voucher xanh bằng khoản thanh toán nhỏ.
- Merchant: gắn tác động xanh vào checkout hoặc sự kiện địa phương.
- Project owner: nhận tiền qua cơ chế giải ngân có điều kiện.
- Verifier/admin: xác nhận tác động trước khi tiền được rút khỏi vault.

## Khách hàng mục tiêu

- Quán cà phê, cửa hàng bán lẻ, sự kiện cộng đồng và trường đại học.
- Doanh nghiệp nhỏ muốn có chiến dịch ESG/CSR minh bạch.
- Người tiêu dùng muốn đóng góp nhỏ nhưng cần bằng chứng công khai.
- Dự án xanh cần huy động vốn cộng đồng với chi phí thấp.

## Lợi thế của Stellar

Stellar phù hợp vì phí giao dịch thấp, tốc độ xử lý nhanh, hỗ trợ native assets qua Stellar Asset Contract, và Soroban cho phép xây vault logic minh bạch. Điều này giúp micro-payment cho tác động xanh trở nên thực tế hơn.

## Bằng chứng Testnet

- Contract ID: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`
- Contract Explorer: <https://stellar.expert/explorer/testnet/contract/CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J>
- Buy voucher transaction: <https://stellar.expert/explorer/testnet/tx/ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96>
- Withdraw funds transaction: <https://stellar.expert/explorer/testnet/tx/c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984>
- Refund voucher transaction: <https://stellar.expert/explorer/testnet/tx/7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf>

## Câu pitch ngắn

Green Impact Voucher là green checkout finance app trên Stellar, giúp doanh nghiệp địa phương biến khoản đóng góp nhỏ của khách hàng thành impact voucher minh bạch, với smart contract vault giữ tiền và chỉ giải ngân sau khi tác động môi trường được xác minh.
