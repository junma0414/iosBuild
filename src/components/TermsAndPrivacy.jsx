// src/components/TermsAndPrivacy.jsx
import React from 'react';
import { Card } from '../components/ui/card';

export const termsContent = {
  en: {
    title: "Terms of Service",
    lastUpdated: "April 15, 2026",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: "By accessing or using LinguMate (the 'Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, please do not use our Service. We reserve the right to update or modify these Terms at any time without prior notice."
      },
      {
        title: "2. Eligibility",
        content: "You must be at least 13 years old to use LinguMate. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that you have parental consent to use the Service."
      },
      {
        title: "3. User Accounts",
        content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms."
      },
      {
        title: "4. Subscription Plans and Billing",
        content: "We offer Free, Pro, and Premium subscription plans. Subscription fees are billed in advance on a monthly or yearly basis, as selected. All fees are non-refundable except as required by law. We may change our fees at any time, but we will provide at least 30 days' notice before any price change takes effect. You may cancel your subscription at any time through your account settings or by contacting support. Cancellation will take effect at the end of your current billing period."
      },
      {
        title: "5. Free Trial",
        content: "We may offer free trials for certain subscription plans. Free trials are available to new users only, one per user. We reserve the right to determine eligibility for free trials. At the end of the free trial period, your subscription will automatically convert to a paid subscription unless you cancel before the trial ends."
      },
      {
        title: "6. Acceptable Use Policy",
        content: "You agree not to: (a) use the Service for any illegal purpose; (b) violate any applicable laws or regulations; (c) infringe upon the intellectual property rights of others; (d) harass, abuse, or harm another person; (e) upload or transmit any viruses, malware, or harmful code; (f) attempt to gain unauthorized access to any part of the Service; (g) use any automated means to access the Service; (h) interfere with or disrupt the Service or its servers; (i) reproduce, duplicate, copy, or resell any part of the Service; (j) use the Service to generate spam or unsolicited messages."
      },
      {
        title: "7. Intellectual Property",
        content: "The Service and its original content, features, and functionality are owned by LinguMate and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not modify, reproduce, distribute, create derivative works of, publicly display, or in any way exploit any of the content, software, or materials available on the Service, except as expressly permitted."
      },
      {
        title: "8. User Content",
        content: "You retain ownership of any content you submit, post, or display on or through the Service ('User Content'). By submitting User Content, you grant LinguMate a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and distribute such content for the purpose of providing and improving the Service. You represent and warrant that you have all necessary rights to grant this license."
      },
      {
        title: "9. AI-Generated Content",
        content: "Our Service uses artificial intelligence to generate learning content, feedback, and corrections. AI-generated content may contain errors or inaccuracies. You are responsible for reviewing and evaluating any AI-generated content before relying on it. LinguMate is not responsible for any errors or omissions in AI-generated content."
      },
      {
        title: "10. Third-Party Services",
        content: "The Service may integrate with third-party services (including but not limited to Stripe for payment processing). Your use of third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the practices of third-party services."
      },
      {
        title: "11. Termination",
        content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease. You may delete your account at any time through the Membership page."
      },
      {
        title: "12. Disclaimer of Warranties",
        content: "THE SERVICE IS PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DO NOT WARRANT THAT THE RESULTS OBTAINED FROM USING THE SERVICE WILL BE ACCURATE OR RELIABLE. YOU USE THE SERVICE AT YOUR OWN RISK."
      },
      {
        title: "13. Limitation of Liability",
        content: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, LINGUMATE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE."
      },
      {
        title: "14. Indemnification",
        content: "You agree to indemnify and hold harmless LinguMate and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights."
      },
      {
        title: "15. Governing Law",
        content: "These Terms shall be governed and construed in accordance with the laws of Singapore, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be resolved exclusively in the courts located in Singapore."
      },
      {
        title: "16. Changes to Terms",
        content: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms."
      },
      {
        title: "17. Contact Information",
        content: "If you have any questions about these Terms, please contact us at: legal@lingumate.com"
      }
    ]
  },
  zh: {
    title: "服务条款",
    lastUpdated: "2026年4月15日",
    sections: [
      {
        title: "1. 条款接受",
        content: "访问或使用 LinguMate（以下简称'服务'）即表示您同意接受这些服务条款（以下简称'条款'）的约束。如果您不同意这些条款，请勿使用我们的服务。我们保留随时更新或修改这些条款的权利，恕不另行通知。"
      },
      {
        title: "2. 资格要求",
        content: "您必须年满13岁才能使用 LinguMate。使用服务即表示您声明并保证您符合此年龄要求。如果您未满18岁，您声明您已获得父母同意使用本服务。"
      },
      {
        title: "3. 用户账户",
        content: "您有责任维护账户凭证的机密性。您同意对您账户下发生的所有活动承担责任。如发现任何未经授权使用您账户的情况，您必须立即通知我们。我们保留暂停或终止违反这些条款的账户的权利。"
      },
      {
        title: "4. 订阅计划和计费",
        content: "我们提供免费、专业版和高级版订阅计划。订阅费用按月或按年提前收取（根据您的选择）。除法律要求外，所有费用不予退还。我们可能随时更改费用，但任何价格变更生效前我们将至少提前30天通知。您可以随时通过账户设置或联系支持取消订阅。取消将在当前计费周期结束时生效。"
      },
      {
        title: "5. 免费试用",
        content: "我们可能为某些订阅计划提供免费试用。免费试用仅限新用户，每人一次。我们保留确定免费试用资格的权利。免费试用期结束时，除非您在试用结束前取消，否则您的订阅将自动转换为付费订阅。"
      },
      {
        title: "6. 可接受使用政策",
        content: "您同意不：(a) 将服务用于任何非法目的；(b) 违反任何适用法律或法规；(c) 侵犯他人的知识产权；(d) 骚扰、虐待或伤害他人；(e) 上传或传播任何病毒、恶意软件或有害代码；(f) 尝试未经授权访问服务的任何部分；(g) 使用任何自动化手段访问服务；(h) 干扰或破坏服务或其服务器；(i) 复制、翻版、拷贝或转售服务的任何部分；(j) 使用服务生成垃圾邮件或未经请求的消息。"
      },
      {
        title: "7. 知识产权",
        content: "服务及其原始内容、特性和功能归 LinguMate 所有，受国际版权、商标、专利、商业秘密和其他知识产权法律保护。除非明确允许，您不得修改、复制、分发、创建衍生作品、公开展示或以任何方式利用服务上的任何内容、软件或材料。"
      },
      {
        title: "8. 用户内容",
        content: "您保留您提交、发布或显示在服务上的任何内容（'用户内容'）的所有权。提交用户内容即表示您授予 LinguMate 全球范围内的、非排他性的、免版税的许可，以使用、复制、修改、改编、发布和分发此类内容，用于提供和改进服务。您声明并保证您拥有授予此许可的所有必要权利。"
      },
      {
        title: "9. AI生成内容",
        content: "我们的服务使用人工智能生成学习内容、反馈和纠正。AI生成的内容可能包含错误或不准确之处。您在依赖任何AI生成内容之前有责任对其进行审查和评估。LinguMate 不对AI生成内容中的任何错误或遗漏负责。"
      },
      {
        title: "10. 第三方服务",
        content: "服务可能集成第三方服务（包括但不限于用于支付处理的 Stripe）。您对第三方服务的使用受其各自服务条款和隐私政策的约束。我们对第三方服务的做法不承担责任。"
      },
      {
        title: "11. 终止",
        content: "我们可以在不事先通知或承担责任的情况下，以任何理由立即终止或暂停您的账户，包括但不限于您违反这些条款的情况。终止后，您使用服务的权利将立即终止。您可以随时通过会员页面删除您的账户。"
      },
      {
        title: "12. 免责声明",
        content: "服务按'原样'和'可用'提供，不附带任何明示或暗示的保证。我们不保证服务将不间断、无错误或安全。我们不保证使用服务获得的结果将准确或可靠。您自行承担使用服务的风险。"
      },
      {
        title: "13. 责任限制",
        content: "在法律允许的最大范围内，LinguMate 不对任何间接的、附带的、特殊的、后果性的或惩罚性的损害赔偿承担责任，包括但不限于利润损失、数据丢失、使用损失、商誉损失或其他无形损失，这些损失源于或与您使用服务有关。"
      },
      {
        title: "14. 赔偿",
        content: "您同意赔偿并使 LinguMate 及其管理人员、董事、员工和代理人免受因您使用服务、违反这些条款或侵犯任何第三方权利而引起的任何索赔、损害赔偿、义务、损失、责任、成本或债务以及费用（包括但不限于律师费）的损害。"
      },
      {
        title: "15. 管辖法律",
        content: "这些条款应受新加坡法律管辖并据其解释，不考虑其冲突法规定。根据这些条款产生的任何争议应专属由位于新加坡的法院解决。"
      },
      {
        title: "16. 条款变更",
        content: "我们保留随时修改或替换这些条款的权利。如果修订是实质性的，我们将在新条款生效前至少提供30天的通知。在这些修订生效后继续访问或使用我们的服务，即表示您同意受修订后条款的约束。"
      },
      {
        title: "17. 联系方式",
        content: "如果您对这些条款有任何疑问，请通过以下方式联系我们：legal@lingumate.com"
      }
    ]
  },
  ms: {
    title: "Terma Perkhidmatan",
    lastUpdated: "15 April 2026",
    sections: [
      {
        title: "1. Penerimaan Terma",
        content: "Dengan mengakses atau menggunakan LinguMate ('Perkhidmatan'), anda bersetuju untuk terikat dengan Terma Perkhidmatan ini ('Terma'). Jika anda tidak bersetuju dengan Terma ini, sila jangan gunakan Perkhidmatan kami. Kami berhak untuk mengemas kini atau mengubah Terma ini pada bila-bila masa tanpa notis terlebih dahulu."
      },
      {
        title: "2. Kelayakan",
        content: "Anda mestilah berumur sekurang-kurangnya 13 tahun untuk menggunakan LinguMate. Dengan menggunakan Perkhidmatan, anda mengaku dan menjamin bahawa anda memenuhi keperluan umur ini. Jika anda berumur di bawah 18 tahun, anda mengaku bahawa anda mempunyai kebenaran ibu bapa untuk menggunakan Perkhidmatan."
      },
      {
        title: "3. Akaun Pengguna",
        content: "Anda bertanggungjawab untuk mengekalkan kerahsiaan bukti kelayakan akaun anda. Anda bersetuju untuk menerima tanggungjawab untuk semua aktiviti yang berlaku di bawah akaun anda. Anda mesti memaklumkan kepada kami dengan segera tentang sebarang penggunaan akaun yang tidak dibenarkan. Kami berhak untuk menggantung atau menamatkan akaun yang melanggar Terma ini."
      },
      {
        title: "4. Pelan Langganan dan Bil",
        content: "Kami menawarkan pelan langganan Percuma, Pro, dan Premium. Yuran langganan dikenakan bil terlebih dahulu secara bulanan atau tahunan, seperti yang dipilih. Semua yuran tidak boleh dikembalikan kecuali seperti yang dikehendaki oleh undang-undang. Kami mungkin mengubah yuran kami pada bila-bila masa, tetapi kami akan memberikan notis sekurang-kurangnya 30 hari sebelum sebarang perubahan harga berkuat kuasa. Anda boleh membatalkan langganan anda pada bila-bila masa melalui tetapan akaun anda atau dengan menghubungi sokongan. Pembatalan akan berkuat kuasa pada akhir tempoh bil semasa anda."
      },
      {
        title: "5. Percubaan Percuma",
        content: "Kami mungkin menawarkan percubaan percuma untuk pelan langganan tertentu. Percubaan percuma hanya tersedia untuk pengguna baharu, satu percubaan setiap pengguna. Kami berhak untuk menentukan kelayakan untuk percubaan percuma. Pada akhir tempoh percubaan percuma, langganan anda akan secara automatik bertukar kepada langganan berbayar melainkan anda membatalkannya sebelum percubaan berakhir."
      },
      {
        title: "6. Dasar Penggunaan yang Dibenarkan",
        content: "Anda bersetuju untuk tidak: (a) menggunakan Perkhidmatan untuk sebarang tujuan haram; (b) melanggar mana-mana undang-undang atau peraturan yang berkenaan; (c) melanggar hak harta intelek orang lain; (d) mengganggu, menyalahguna, atau membahayakan orang lain; (e) memuat naik atau menghantar sebarang virus, perisian hasad, atau kod berbahaya; (f) cuba mendapatkan akses tanpa kebenaran ke mana-mana bahagian Perkhidmatan; (g) menggunakan sebarang cara automatik untuk mengakses Perkhidmatan; (h) mengganggu atau mengganggu Perkhidmatan atau pelayannya; (i) mengeluarkan semula, menggandakan, menyalin, atau menjual semula mana-mana bahagian Perkhidmatan; (j) menggunakan Perkhidmatan untuk menjana spam atau mesej yang tidak diminta."
      },
      {
        title: "7. Harta Intelek",
        content: "Perkhidmatan dan kandungan asli, ciri, dan fungsinya adalah milik LinguMate dan dilindungi oleh hak cipta antarabangsa, tanda dagangan, paten, rahsia perdagangan, dan undang-undang harta intelek lain. Anda tidak boleh mengubah suai, mengeluarkan semula, mengedarkan, membuat karya terbitan, memaparkan secara terbuka, atau dalam apa jua cara mengeksploitasi mana-mana kandungan, perisian, atau bahan yang tersedia di Perkhidmatan, kecuali seperti yang dibenarkan secara nyata."
      },
      {
        title: "8. Kandungan Pengguna",
        content: "Anda mengekalkan pemilikan sebarang kandungan yang anda serahkan, hantar, atau paparkan pada atau melalui Perkhidmatan ('Kandungan Pengguna'). Dengan menyerahkan Kandungan Pengguna, anda memberikan LinguMate lesen global, tidak eksklusif, bebas royalti untuk menggunakan, mengeluarkan semula, mengubah suai, menyesuaikan, menerbitkan, dan mengedarkan kandungan tersebut untuk tujuan menyediakan dan menambah baik Perkhidmatan. Anda mengaku dan menjamin bahawa anda mempunyai semua hak yang diperlukan untuk memberikan lesen ini."
      },
      {
        title: "9. Kandungan Dijana AI",
        content: "Perkhidmatan kami menggunakan kecerdasan buatan untuk menjana kandungan pembelajaran, maklum balas, dan pembetulan. Kandungan yang dijana AI mungkin mengandungi ralat atau ketidaktepatan. Anda bertanggungjawab untuk menyemak dan menilai sebarang kandungan yang dijana AI sebelum bergantung padanya. LinguMate tidak bertanggungjawab atas sebarang ralat atau ketinggalan dalam kandungan yang dijana AI."
      },
      {
        title: "10. Perkhidmatan Pihak Ketiga",
        content: "Perkhidmatan mungkin bersepadu dengan perkhidmatan pihak ketiga (termasuk tetapi tidak terhad kepada Stripe untuk pemprosesan pembayaran). Penggunaan anda terhadap perkhidmatan pihak ketiga adalah tertakluk kepada terma perkhidmatan dan dasar privasi masing-masing. Kami tidak bertanggungjawab terhadap amalan perkhidmatan pihak ketiga."
      },
      {
        title: "11. Penamatan",
        content: "Kami boleh menamatkan atau menggantung akaun anda dengan segera, tanpa notis atau liabiliti terlebih dahulu, atas sebarang sebab, termasuk tanpa batasan jika anda melanggar Terma ini. Selepas penamatan, hak anda untuk menggunakan Perkhidmatan akan terhenti serta-merta. Anda boleh memadamkan akaun anda pada bila-bila masa melalui halaman Keahlian."
      },
      {
        title: "12. Penafian Jaminan",
        content: "PERKHIDMATAN DISEDIAKAN 'SEPERTI ADA' DAN 'SEPERTI TERSAEDIA' TANPA JAMINAN APA-APA JENIS, SAMA ADA TERSURAT ATAU TERSIRAT. KAMI TIDAK MENJAMIN BAHWA PERKHIDMATAN AKAN TIDAK TERGANGU, BEBAS RALAT, ATAU SELAMAT. KAMI TIDAK MENJAMIN BAHAWA KEPUTUSAN YANG DIPEROLEHI DARIPADA MENGGUNAKAN PERKHIDMATAN AKAN TEPAT ATAU BOLEH DIHARAPKAN. ANDA MENGGUNAKAN PERKHIDMATAN ATAS RISIKO SENDIRI."
      },
      {
        title: "13. Had Liabiliti",
        content: "SETAKAT YANG DIBENARKAN OLEH UNDANG-UNDANG, LINGUMATE TIDAK BERTANGGUNGJAWAB ATAS SEBARANG KEROSAKAN TIDAK LANGSUNG, AKSESORI, KHAS, BANGKITAN, ATAU HUKUMAN, TERMASUK TANPA BATASAN, KEHILANGAN KEUNTUNGAN, DATA, PENGGUNAAN, MUHABBAH BAIK, ATAU KERUGIAN TIDAK KETARA LAIN, YANG TIMBUL DARIPADA ATAU BERKAITAN DENGAN PENGGUNAAN PERKHIDMATAN ANDA."
      },
      {
        title: "14. Indemnifikasi",
        content: "Anda bersetuju untuk memberi ganti rugi dan membebaskan LinguMate serta pegawai, pengarah, pekerja, dan ejennya daripada dan terhadap sebarang tuntutan, kerosakan, kewajipan, kerugian, liabiliti, kos, atau hutang, dan perbelanjaan (termasuk tetapi tidak terhad kepada yuran peguam) yang timbul daripada penggunaan Perkhidmatan anda, pelanggaran Terma ini, atau pelanggaran hak pihak ketiga anda."
      },
      {
        title: "15. Undang-undang yang Mentadbir",
        content: "Terma ini hendaklah ditadbir dan ditafsirkan mengikut undang-undang Singapura, tanpa mengambil kira peruntukan pertikaian undang-undangnya. Sebarang pertikaian yang timbul di bawah Terma ini hendaklah diselesaikan secara eksklusif di mahkamah yang terletak di Singapura."
      },
      {
        title: "16. Perubahan Terma",
        content: "Kami berhak untuk mengubah suai atau menggantikan Terma ini pada bila-bila masa. Jika semakan adalah penting, kami akan memberikan notis sekurang-kurangnya 30 hari sebelum sebarang terma baharu berkuat kuasa. Dengan terus mengakses atau menggunakan Perkhidmatan kami selepas semakan tersebut berkuat kuasa, anda bersetuju untuk terikat dengan terma yang dipinda."
      },
      {
        title: "17. Maklumat Perhubungan",
        content: "Jika anda mempunyai sebarang soalan tentang Terma ini, sila hubungi kami di: legal@lingumate.com"
      }
    ]
  },
  ja: {
    title: "利用規約",
    lastUpdated: "2026年4月15日",
    sections: [
      {
        title: "1. 規約への同意",
        content: "LinguMate（以下「本サービス」）にアクセスまたは使用することにより、本利用規約（以下「本規約」）に拘束されることに同意したものとします。本規約に同意しない場合は、本サービスを使用しないでください。当社は、事前の通知なしにいつでも本規約を更新または変更する権利を留保します。"
      },
      {
        title: "2. 資格",
        content: "LinguMateを使用するには、13歳以上である必要があります。本サービスを使用することにより、お客様はこの年齢要件を満たしていることを表明し、保証するものとします。18歳未満の場合は、親の同意を得て本サービスを使用することを表明するものとします。"
      },
      {
        title: "3. ユーザーアカウント",
        content: "お客様は、アカウント認証情報の機密性を維持する責任を負います。お客様は、お客様のアカウントで発生するすべての活動に対する責任を負うことに同意するものとします。アカウントの不正使用を発見した場合は、直ちに当社に通知するものとします。当社は、本規約に違反するアカウントを停止または終了する権利を留保します。"
      },
      {
        title: "4. サブスクリプションプランと請求",
        content: "当社は、無料、プロ、プレミアムのサブスクリプションプランを提供しています。サブスクリプション料金は、選択に応じて月次または年次で前払いされます。法律で要求される場合を除き、すべての料金は返金不可です。当社はいつでも料金を変更する場合がありますが、料金変更の少なくとも30日前に通知します。お客様はいつでもアカウント設定からまたはサポートに連絡してサブスクリプションをキャンセルできます。キャンセルは現在の請求期間の終了時に有効になります。"
      },
      {
        title: "5. 無料トライアル",
        content: "当社は特定のサブスクリプションプランで無料トライアルを提供する場合があります。無料トライアルは新規ユーザーのみが利用でき、ユーザー1人につき1回です。当社は無料トライアルの資格を決定する権利を留保します。無料トライアル期間の終了時、トライアル終了前にキャンセルしない限り、サブスクリプションは自動的に有料サブスクリプションに変換されます。"
      },
      {
        title: "6. 利用許容ポリシー",
        content: "お客様は以下を行わないことに同意するものとします：(a) 違法目的で本サービスを使用すること；(b) 適用される法律または規制に違反すること；(c) 他人の知的財産権を侵害すること；(d) 他人を嫌がらせ、虐待、または害すること；(e) ウイルス、マルウェア、または有害なコードをアップロードまたは送信すること；(f) 本サービスのいかなる部分への不正アクセスを試みること；(g) 自動化された手段を使用して本サービスにアクセスすること；(h) 本サービスまたはそのサーバーを妨害または中断すること；(i) 本サービスのいかなる部分も複製、複写、コピー、または再販すること；(j) スパムまたは未承諾メッセージを生成するために本サービスを使用すること。"
      },
      {
        title: "7. 知的財産",
        content: "本サービスおよびそのオリジナルコンテンツ、機能、機能性はLinguMateに所有され、国際的な著作権、商標、特許、営業秘密、およびその他の知的財産法によって保護されています。明示的に許可されている場合を除き、お客様は本サービスで利用可能なコンテンツ、ソフトウェア、または資料を変更、複製、配布、派生作品を作成、公に表示、またはいかなる方法でも利用することはできません。"
      },
      {
        title: "8. ユーザーコンテンツ",
        content: "お客様は、本サービスに提出、投稿、または表示するコンテンツ（「ユーザーコンテンツ」）の所有権を保持します。ユーザーコンテンツを提出することにより、お客様は、本サービスを提供および改善する目的で、かかるコンテンツを使用、複製、変更、適応、公開、および配布するための世界的、非独占的、ロイヤリティフリーのライセンスをLinguMateに付与します。お客様は、このライセンスを付与するために必要なすべての権利を有することを表明し、保証するものとします。"
      },
      {
        title: "9. AI生成コンテンツ",
        content: "本サービスは、学習コンテンツ、フィードバック、および修正を生成するために人工知能を使用しています。AI生成コンテンツにはエラーや不正確さが含まれる場合があります。お客様は、AI生成コンテンツに依存する前に、それをレビューおよび評価する責任を負います。LinguMateは、AI生成コンテンツのエラーや省略について責任を負いません。"
      },
      {
        title: "10. サードパーティサービス",
        content: "本サービスは、サードパーティサービス（支払い処理のためのStripeを含むがこれに限らない）と統合する場合があります。サードパーティサービスの使用は、それぞれの利用規約およびプライバシーポリシーに従うものとします。当社はサードパーティサービスの慣行について責任を負いません。"
      },
      {
        title: "11. 契約解除",
        content: "当社は、お客様が本規約に違反した場合を含むがこれに限らず、いかなる理由でも、事前の通知または責任なく、お客様のアカウントを直ちに終了または停止することができます。終了後、本サービスを使用するお客様の権利は直ちに停止します。お客様はいつでもメンバーシップページからアカウントを削除できます。"
      },
      {
        title: "12. 保証の否認",
        content: "本サービスは「現状有姿」および「利用可能な状態」で提供され、明示または黙示を問わずいかなる種類の保証もありません。当社は、本サービスが中断されないこと、エラーがないこと、または安全であることを保証しません。当社は、本サービスの使用から得られる結果が正確または信頼できることを保証しません。お客様は自己の責任で本サービスを使用するものとします。"
      },
      {
        title: "13. 責任の制限",
        content: "法律で認められる最大限の範囲で、LinguMateは、お客様による本サービスの使用に起因または関連して生じるいかなる間接的、付随的、特別、結果的、または懲罰的損害（利益、データ、使用、のれん、またはその他の無形損失の損失を含むがこれに限らない）についても責任を負いません。"
      },
      {
        title: "14. 補償",
        content: "お客様は、本サービスの使用、本規約の違反、または第三者の権利の侵害に起因するいかなる請求、損害、義務、損失、責任、費用、または負債、および費用（弁護士費用を含むがこれに限らない）からLinguMateおよびその役員、取締役、従業員、代理人を補償し、免責することに同意するものとします。"
      },
      {
        title: "15. 準拠法",
        content: "本規約は、その抵触法の規定にかかわらず、シンガポール法に準拠し、解釈されるものとします。本規約に基づいて生じる紛争は、シンガポールにある裁判所を専属的管轄裁判所として解決されるものとします。"
      },
      {
        title: "16. 規約の変更",
        content: "当社はいつでも本規約を変更または置き換える権利を留保します。改訂が重要な場合は、新しい規約が発効する少なくとも30日前に通知します。改訂が発効した後に本サービスへのアクセスまたは使用を継続することにより、お客様は改訂された規約に拘束されることに同意したものとします。"
      },
      {
        title: "17. 連絡先",
        content: "本規約についてご質問がある場合は、legal@lingumate.comまでお問い合わせください。"
      }
    ]
  },
  ko: {
    title: "이용약관",
    lastUpdated: "2026년 4월 15일",
    sections: [
      {
        title: "1. 약관 동의",
        content: "LinguMate('서비스')에 액세스하거나 사용함으로써 귀하는 본 이용약관('약관')에 구속되는 데 동의합니다. 본 약관에 동의하지 않는 경우 서비스를 사용하지 마십시오. 당사는 사전 통지 없이 언제든지 본 약관을 업데이트하거나 변경할 권리를 보유합니다."
      },
      {
        title: "2. 자격 요건",
        content: "LinguMate를 사용하려면 최소 13세 이상이어야 합니다. 서비스를 사용함으로써 귀하는 이 연령 요건을 충족한다고 진술하고 보증합니다. 18세 미만인 경우, 귀하는 부모의 동의를 받아 서비스를 사용한다고 진술합니다."
      },
      {
        title: "3. 사용자 계정",
        content: "귀하는 계정 자격 증명의 기밀을 유지할 책임이 있습니다. 귀하는 귀하의 계정에서 발생하는 모든 활동에 대한 책임을 수락하는 데 동의합니다. 귀하는 귀하의 계정에 대한 무단 사용이 있는 경우 즉시 당사에 통지해야 합니다. 당사는 본 약관을 위반하는 계정을 정지 또는 종료할 권리를 보유합니다."
      },
      {
        title: "4. 구독 플랜 및 결제",
        content: "당사는 무료, 프로, 프리미엄 구독 플랜을 제공합니다. 구독 요금은 선택에 따라 월별 또는 연별로 선불 청구됩니다. 법률에서 요구하는 경우를 제외하고 모든 요금은 환불되지 않습니다. 당사는 언제든지 요금을 변경할 수 있지만, 요금 변경이 발효되기 최소 30일 전에 통지합니다. 귀하는 언제든지 계정 설정을 통해 또는 지원팀에 연락하여 구독을 취소할 수 있습니다. 취소는 현재 청구 기간이 끝날 때 효력이 발생합니다."
      },
      {
        title: "5. 무료 체험",
        content: "당사는 특정 구독 플랜에 대해 무료 체험을 제공할 수 있습니다. 무료 체험은 신규 사용자만 이용할 수 있으며, 사용자당 한 번입니다. 당사는 무료 체험 자격을 결정할 권리를 보유합니다. 무료 체험 기간이 끝나면 체험이 끝나기 전에 취소하지 않는 한 구독이 자동으로 유료 구독으로 전환됩니다."
      },
      {
        title: "6. 허용 가능한 사용 정책",
        content: "귀하는 다음을 하지 않기로 동의합니다: (a) 불법 목적으로 서비스를 사용하는 행위; (b) 해당 법률 또는 규정을 위반하는 행위; (c) 타인의 지적 재산권을 침해하는 행위; (d) 다른 사람을 괴롭히거나, 학대하거나, 해를 끼치는 행위; (e) 바이러스, 맬웨어 또는 유해한 코드를 업로드하거나 전송하는 행위; (f) 서비스의 모든 부분에 대한 무단 액세스를 시도하는 행위; (g) 자동화된 수단을 사용하여 서비스에 액세스하는 행위; (h) 서비스 또는 서버를 방해하거나 방해하는 행위; (i) 서비스의 모든 부분을 복제, 복사, 복제 또는 재판매하는 행위; (j) 스팸 또는 원치 않는 메시지를 생성하기 위해 서비스를 사용하는 행위."
      },
      {
        title: "7. 지적 재산권",
        content: "서비스 및 그 독창적인 콘텐츠, 기능은 LinguMate의 소유이며 국제 저작권, 상표권, 특허권, 영업 비밀 및 기타 지적 재산권 법률에 의해 보호됩니다. 명시적으로 허용된 경우를 제외하고 귀하는 서비스에서 사용 가능한 콘텐츠, 소프트웨어 또는 자료를 수정, 복제, 배포, 파생 작업 생성, 공개 표시 또는 어떤 방식으로든 이용할 수 없습니다."
      },
      {
        title: "8. 사용자 콘텐츠",
        content: "귀하는 서비스에 제출, 게시 또는 표시하는 콘텐츠('사용자 콘텐츠')의 소유권을 유지합니다. 사용자 콘텐츠를 제출함으로써 귀하는 서비스를 제공하고 개선할 목적으로 해당 콘텐츠를 사용, 복제, 수정, 각색, 게시 및 배포할 수 있는 전 세계적, 비독점적, 로열티 없는 라이선스를 LinguMate에 부여합니다. 귀하는 이 라이선스를 부여하는 데 필요한 모든 권리를 보유하고 있음을 진술하고 보증합니다."
      },
      {
        title: "9. AI 생성 콘텐츠",
        content: "당사 서비스는 학습 콘텐츠, 피드백 및 교정을 생성하기 위해 인공지능을 사용합니다. AI 생성 콘텐츠에는 오류나 부정확성이 포함될 수 있습니다. 귀하는 AI 생성 콘텐츠에 의존하기 전에 이를 검토하고 평가할 책임이 있습니다. LinguMate는 AI 생성 콘텐츠의 오류나 누락에 대해 책임을 지지 않습니다."
      },
      {
        title: "10. 제3자 서비스",
        content: "서비스는 제3자 서비스(결제 처리를 위한 Stripe 포함하나 이에 국한되지 않음)와 통합될 수 있습니다. 제3자 서비스의 사용은 각각의 이용약관 및 개인정보 처리방침의 적용을 받습니다. 당사는 제3자 서비스의 관행에 대해 책임을 지지 않습니다."
      },
      {
        title: "11. 계정 정지",
        content: "당사는 귀하가 본 약관을 위반하는 경우를 포함하되 이에 국한되지 않는 어떠한 이유로든 사전 통지나 책임 없이 귀하의 계정을 즉시 종료하거나 정지할 수 있습니다. 종료 후 서비스를 사용할 귀하의 권리는 즉시 중단됩니다. 귀하는 언제든지 멤버십 페이지를 통해 계정을 삭제할 수 있습니다."
      },
      {
        title: "12. 보증 부인",
        content: "서비스는 '있는 그대로' 및 '이용 가능한 대로' 제공되며 명시적 또는 묵시적인 어떠한 종류의 보증도 없습니다. 당사는 서비스가 중단되지 않거나, 오류가 없거나, 안전할 것이라고 보증하지 않습니다. 당사는 서비스 사용으로 얻은 결과가 정확하거나 신뢰할 수 있을 것이라고 보증하지 않습니다. 귀하는 자신의 책임 하에 서비스를 사용합니다."
      },
      {
        title: "13. 책임의 제한",
        content: "법률이 허용하는 최대 범위 내에서 LinguMate는 귀하의 서비스 사용으로 인해 또는 이와 관련하여 발생하는 간접적, 부수적, 특별, 결과적 또는 징벌적 손해(이익 손실, 데이터 손실, 사용 손실, 영업권 손실 또는 기타 무형의 손실을 포함하되 이에 국한되지 않음)에 대해 책임을 지지 않습니다."
      },
      {
        title: "14. 면책",
        content: "귀하는 서비스 사용, 본 약관 위반 또는 제3자 권리 침해로 인해 발생하는 모든 청구, 손해, 의무, 손실, 책임, 비용 또는 부채 및 비용(변호사 비용을 포함하나 이에 국한되지 않음)으로부터 LinguMate 및 그 임원, 이사, 직원, 대리인을 면책하고 면제하는 데 동의합니다."
      },
      {
        title: "15. 준거법",
        content: "본 약관은 충돌법 조항에 관계없이 싱가포르법에 따라 규율되고 해석됩니다. 본 약관에 따라 발생하는 모든 분쟁은 싱가포르에 소재한 법원에서만 해결됩니다."
      },
      {
        title: "16. 약관 변경",
        content: "당사는 언제든지 본 약관을 수정하거나 대체할 권리를 보유합니다. 개정이 중요한 경우, 당사는 새로운 약관이 발효되기 최소 30일 전에 통지합니다. 개정 사항이 발효된 후 계속해서 서비스에 액세스하거나 사용함으로써 귀하는 개정된 약관에 구속되는 데 동의합니다."
      },
      {
        title: "17. 연락처",
        content: "본 약관에 대해 질문이 있으시면 legal@lingumate.com으로 연락해 주십시오."
      }
    ]
  }
};

export const privacyContent = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "April 15, 2026",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We collect information you provide directly to us, including: (a) Account information (name, email address, password); (b) Profile information (language preferences, learning goals, proficiency level); (c) Learning content (essays, conversation transcripts, listening exercise answers, oral practice recordings); (d) Usage data (feature usage, time spent, learning progress); (e) Payment information (processed securely by Stripe, we do not store full payment details); (f) Device information (browser type, IP address, device identifiers)."
      },
      {
        title: "2. How We Use Your Information",
        content: "We use your information to: (a) Provide, maintain, and improve our services; (b) Process your transactions and manage your subscription; (c) Generate personalized learning content and feedback using AI; (d) Send you technical notices, support messages, and security alerts; (e) Respond to your comments and questions; (f) Analyze usage patterns to improve language learning features; (g) Detect and prevent fraud, abuse, and security incidents; (h) Comply with legal obligations."
      },
      {
        title: "3. Data Security",
        content: "We implement industry-standard security measures to protect your personal information: (a) All data transmitted using TLS/SSL encryption (HTTPS); (b) Passwords hashed using bcrypt (not stored in plain text); (c) Database encrypted at rest; (d) Regular security audits and vulnerability assessments; (e) Access restricted to authorized personnel only on a need-to-know basis; (f) Multi-factor authentication for administrative access; (g) Regular backups with offsite storage. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security."
      },
      {
        title: "4. Data Retention",
        content: "We retain your personal information for as long as your account is active or as needed to provide you services. Specifically: (a) Account data retained while your account is active; (b) Learning content retained to track your progress; (c) After account deletion, we will delete or anonymize your personal information within 30 days; (d) Anonymous usage data may be retained longer for analytics and service improvement; (e) Payment records retained for 7 years to comply with tax laws."
      },
      {
        title: "5. Sharing of Information",
        content: "We do not sell, trade, or rent your personal information to third parties. We may share information with: (a) Service providers (Stripe for payment processing, AWS for hosting, SendGrid for emails) who are contractually obligated to protect your data; (b) AI service providers to generate learning content - data is anonymized where possible; (c) Law enforcement or regulatory authorities when required by law or to protect our rights; (d) Successors in the event of a merger, acquisition, or sale of assets. We require all third parties to respect the security of your personal data and treat it in accordance with the law."
      },
      {
        title: "6. Your Rights",
        content: "Depending on your location, you may have the following rights: (a) Access: Request a copy of your personal information; (b) Rectification: Correct inaccurate or incomplete information; (c) Erasure: Request deletion of your personal information; (d) Restriction: Request restriction of processing; (e) Portability: Receive your data in a structured, commonly used format; (f) Object: Object to certain processing activities; (g) Withdraw Consent: Withdraw consent at any time without affecting the lawfulness of processing based on consent before withdrawal. To exercise these rights, contact us at privacy@lingumate.com."
      },
      {
        title: "7. Cookies and Tracking",
        content: "We use cookies and similar tracking technologies to: (a) Authenticate users and maintain sessions; (b) Remember your preferences and settings; (c) Analyze service usage and improve performance; (d) Prevent fraud and enhance security. You can control cookies through your browser settings. Disabling cookies may affect service functionality."
      },
      {
        title: "8. International Data Transfers",
        content: "Your information may be transferred to and processed in countries other than your own. These countries may have data protection laws different from your country. We implement appropriate safeguards, including Standard Contractual Clauses, to ensure your data receives adequate protection."
      },
      {
        title: "9. Children's Privacy",
        content: "Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to delete such information."
      },
      {
        title: "10. Third-Party Links",
        content: "Our service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. We encourage you to read the privacy policies of any third-party websites you visit."
      },
      {
        title: "11. Changes to This Policy",
        content: "We may update this privacy policy from time to time. We will notify you of any material changes by: (a) Posting the new policy on this page; (b) Updating the 'Last Updated' date; (c) Sending you an email notification (for significant changes). We encourage you to review this policy periodically."
      },
      {
        title: "12. Contact Us",
        content: "If you have any questions about this Privacy Policy or our data practices, please contact us at: Email: privacy@lingumate.com. You also have the right to lodge a complaint with your local data protection authority."
      }
    ]
  },
  zh: {
    title: "隐私政策",
    lastUpdated: "2026年4月15日",
    sections: [
      {
        title: "1. 我们收集的信息",
        content: "我们收集您直接提供给我们的信息，包括：(a) 账户信息（姓名、邮箱地址、密码）；(b) 个人资料信息（语言偏好、学习目标、熟练程度）；(c) 学习内容（作文、对话记录、听力练习答案、口语练习录音）；(d) 使用数据（功能使用情况、使用时长、学习进度）；(e) 支付信息（由 Stripe 安全处理，我们不存储完整支付详情）；(f) 设备信息（浏览器类型、IP地址、设备标识符）。"
      },
      {
        title: "2. 我们如何使用您的信息",
        content: "我们使用您的信息来：(a) 提供、维护和改进我们的服务；(b) 处理您的交易并管理您的订阅；(c) 使用 AI 生成个性化学习内容和反馈；(d) 向您发送技术通知、支持消息和安全警报；(e) 回复您的评论和问题；(f) 分析使用模式以改进语言学习功能；(g) 检测和防止欺诈、滥用和安全事件；(h) 遵守法律义务。"
      },
      {
        title: "3. 数据安全",
        content: "我们实施行业标准的安全措施来保护您的个人信息：(a) 所有数据传输使用 TLS/SSL 加密（HTTPS）；(b) 密码使用 bcrypt 哈希存储（不存储明文）；(c) 数据库静态加密；(d) 定期安全审计和漏洞评估；(e) 仅授权人员基于需要知道的原则访问；(f) 管理访问的多因素认证；(g) 定期备份和异地存储。然而，互联网上的传输方式没有 100% 安全的，我们无法保证绝对安全。"
      },
      {
        title: "4. 数据保留",
        content: "只要您的账户处于活动状态或需要向您提供服务，我们就会保留您的个人信息。具体而言：(a) 账户活跃期间保留账户数据；(b) 保留学习内容以跟踪您的进度；(c) 账户删除后，我们将在 30 天内删除或匿名化您的个人信息；(d) 匿名使用数据可能保留更长时间用于分析和服务改进；(e) 支付记录保留 7 年以遵守税法。"
      },
      {
        title: "5. 信息共享",
        content: "我们不会向第三方出售、交易或出租您的个人信息。我们可能与以下各方共享信息：(a) 服务提供商（用于支付处理的 Stripe、用于托管的 AWS、用于电子邮件的 SendGrid），他们有合同义务保护您的数据；(b) AI 服务提供商以生成学习内容 - 数据在可能的情况下进行匿名化；(c) 法律要求或为保护我们权利时的执法或监管机构；(d) 合并、收购或资产出售时的继任者。我们要求所有第三方尊重您个人数据的安全性并依法处理。"
      },
      {
        title: "6. 您的权利",
        content: "根据您所在的位置，您可能拥有以下权利：(a) 访问：请求您的个人信息副本；(b) 更正：更正不准确或不完整的信息；(c) 删除：请求删除您的个人信息；(d) 限制：请求限制处理；(e) 可携带性：以结构化、常用格式接收您的数据；(f) 反对：反对某些处理活动；(g) 撤回同意：随时撤回同意，不影响撤回前基于同意的处理的合法性。要行使这些权利，请通过 privacy@lingumate.com 联系我们。"
      },
      {
        title: "7. Cookie 和追踪",
        content: "我们使用 Cookie 和类似的追踪技术来：(a) 验证用户身份并维持会话；(b) 记住您的偏好和设置；(c) 分析服务使用情况并改进性能；(d) 防止欺诈和增强安全性。您可以通过浏览器设置控制 Cookie。禁用 Cookie 可能会影响服务功能。"
      },
      {
        title: "8. 国际数据传输",
        content: "您的信息可能被传输到您所在国家以外的国家并在那里处理。这些国家的数据保护法律可能与您所在国家不同。我们实施适当的保障措施，包括标准合同条款，以确保您的数据得到充分保护。"
      },
      {
        title: "9. 儿童隐私",
        content: "我们的服务不适用于 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。如果您是家长或监护人，并且认为您的孩子向我们提供了个人信息，请立即联系我们。我们将采取措施删除此类信息。"
      },
      {
        title: "10. 第三方链接",
        content: "我们的服务可能包含指向第三方网站或服务的链接。我们对这些第三方的隐私实践或内容不承担责任。我们鼓励您阅读您访问的任何第三方网站的隐私政策。"
      },
      {
        title: "11. 本政策的变更",
        content: "我们可能不时更新本隐私政策。我们将通过以下方式通知您任何重大变更：(a) 在本页面发布新政策；(b) 更新“最后更新”日期；(c) 向您发送电子邮件通知（对于重大变更）。我们鼓励您定期查看本政策。"
      },
      {
        title: "12. 联系我们",
        content: "如果您对本隐私政策或我们的数据实践有任何疑问，请通过以下方式联系我们：邮箱：privacy@lingumate.com。您也有权向您当地的数据保护机构提出投诉。"
      }
    ]
  },
  ms: {
    title: "Dasar Privasi",
    lastUpdated: "15 April 2026",
    sections: [
      {
        title: "1. Maklumat Yang Kami Kumpul",
        content: "Kami mengumpul maklumat yang anda berikan terus kepada kami, termasuk: (a) Maklumat akaun (nama, alamat emel, kata laluan); (b) Maklumat profil (keutamaan bahasa, matlamat pembelajaran, tahap kecekapan); (c) Kandungan pembelajaran (esei, transkrip perbualan, jawapan latihan mendengar, rakaman latihan lisan); (d) Data penggunaan (penggunaan ciri, masa yang diluangkan, kemajuan pembelajaran); (e) Maklumat pembayaran (diproses dengan selamat oleh Stripe, kami tidak menyimpan butiran pembayaran penuh); (f) Maklumat peranti (jenis pelayar, alamat IP, pengecam peranti)."
      },
      {
        title: "2. Cara Kami Menggunakan Maklumat Anda",
        content: "Kami menggunakan maklumat anda untuk: (a) Menyediakan, mengekalkan, dan menambah baik perkhidmatan kami; (b) Memproses transaksi anda dan mengurus langganan anda; (c) Menjana kandungan dan maklum balas pembelajaran yang diperibadikan menggunakan AI; (d) Menghantar notis teknikal, mesej sokongan, dan amaran keselamatan; (e) Membalas komen dan soalan anda; (f) Menganalisis corak penggunaan untuk menambah baik ciri pembelajaran bahasa; (g) Mengesan dan mencegah penipuan, penyalahgunaan, dan insiden keselamatan; (h) Mematuhi kewajipan undang-undang."
      },
      {
        title: "3. Keselamatan Data",
        content: "Kami melaksanakan langkah keselamatan standard industri untuk melindungi maklumat peribadi anda: (a) Semua data dihantar menggunakan penyulitan TLS/SSL (HTTPS); (b) Kata laluan dihash menggunakan bcrypt (tidak disimpan dalam teks biasa); (c) Pangkalan data disulitkan semasa rehat; (d) Audit keselamatan berkala dan penilaian kelemahan; (e) Akses terhad kepada kakitangan bertauliah sahaja; (f) Pengesahan berbilang faktor untuk akses pentadbiran; (g) Sandaran berkala dengan storan luar tapak. Walau bagaimanapun, tiada kaedah penghantaran melalui Internet 100% selamat, dan kami tidak dapat menjamin keselamatan mutlak."
      },
      {
        title: "4. Penyimpanan Data",
        content: "Kami mengekalkan maklumat peribadi anda selagi akaun anda aktif atau seperti yang diperlukan untuk memberikan perkhidmatan kepada anda. Secara khusus: (a) Data akaun dikekalkan semasa akaun anda aktif; (b) Kandungan pembelajaran dikekalkan untuk menjejak kemajuan anda; (c) Selepas pemadaman akaun, kami akan memadam atau menganonimkan maklumat peribadi anda dalam masa 30 hari; (d) Data penggunaan tanpa nama mungkin dikekalkan lebih lama untuk analisis dan penambahbaikan perkhidmatan; (e) Rekod pembayaran dikekalkan selama 7 tahun untuk mematuhi undang-undang cukai."
      },
      {
        title: "5. Perkongsian Maklumat",
        content: "Kami tidak menjual, berdagang, atau menyewakan maklumat peribadi anda kepada pihak ketiga. Kami mungkin berkongsi maklumat dengan: (a) Pembekal perkhidmatan (Stripe untuk pemprosesan pembayaran, AWS untuk hosting, SendGrid untuk emel) yang mempunyai kewajipan kontrak untuk melindungi data anda; (b) Pembekal perkhidmatan AI untuk menjana kandungan pembelajaran - data tanpa nama di mana mungkin; (c) Pihak berkuasa penguatkuasaan undang-undang atau kawal selia apabila dikehendaki oleh undang-undang atau untuk melindungi hak kami; (d) Pengganti sekiranya berlaku penggabungan, pengambilalihan, atau penjualan aset. Kami memerlukan semua pihak ketiga untuk menghormati keselamatan data peribadi anda dan merawatnya mengikut undang-undang."
      },
      {
        title: "6. Hak Anda",
        content: "Bergantung pada lokasi anda, anda mungkin mempunyai hak berikut: (a) Akses: Meminta salinan maklumat peribadi anda; (b) Pembetulan: Membetulkan maklumat yang tidak tepat atau tidak lengkap; (c) Pemadaman: Meminta pemadaman maklumat peribadi anda; (d) Sekatan: Meminta sekatan pemprosesan; (e) Kebolehpindahan: Menerima data anda dalam format berstruktur yang biasa digunakan; (f) Bantahan: Membantah aktiviti pemprosesan tertentu; (g) Menarik Persetujuan: Menarik persetujuan pada bila-bila masa tanpa menjejaskan kesahihan pemprosesan berdasarkan persetujuan sebelum penarikan balik. Untuk melaksanakan hak ini, hubungi kami di privacy@lingumate.com."
      },
      {
        title: "7. Cookie dan Penjejakan",
        content: "Kami menggunakan cookie dan teknologi penjejakan serupa untuk: (a) Mengesahkan pengguna dan mengekalkan sesi; (b) Mengingati keutamaan dan tetapan anda; (c) Menganalisis penggunaan perkhidmatan dan meningkatkan prestasi; (d) Mencegah penipuan dan meningkatkan keselamatan. Anda boleh mengawal cookie melalui tetapan pelayar anda. Melumpuhkan cookie boleh menjejaskan fungsi perkhidmatan."
      },
      {
        title: "8. Pemindahan Data Antarabangsa",
        content: "Maklumat anda mungkin dipindahkan ke dan diproses di negara selain daripada negara anda sendiri. Negara-negara ini mungkin mempunyai undang-undang perlindungan data yang berbeza dari negara anda. Kami melaksanakan langkah perlindungan yang sesuai, termasuk Klausul Kontrak Standard, untuk memastikan data anda menerima perlindungan yang mencukupi."
      },
      {
        title: "9. Privasi Kanak-kanak",
        content: "Perkhidmatan kami tidak bertujuan untuk kanak-kanak di bawah umur 13 tahun. Kami tidak dengan sengaja mengumpul maklumat peribadi daripada kanak-kanak di bawah 13 tahun. Jika anda adalah ibu bapa atau penjaga dan percaya bahawa anak anda telah memberikan maklumat peribadi kepada kami, sila hubungi kami dengan segera. Kami akan mengambil langkah untuk memadamkan maklumat tersebut."
      },
      {
        title: "10. Pautan Pihak Ketiga",
        content: "Perkhidmatan kami mungkin mengandungi pautan ke laman web atau perkhidmatan pihak ketiga. Kami tidak bertanggungjawab terhadap amalan privasi atau kandungan pihak ketiga ini. Kami menggalakkan anda membaca dasar privasi mana-mana laman web pihak ketiga yang anda lawati."
      },
      {
        title: "11. Perubahan Dasar Ini",
        content: "Kami mungkin mengemas kini dasar privasi ini dari semasa ke semasa. Kami akan memberitahu anda tentang sebarang perubahan material dengan: (a) Menyiarkan dasar baharu di halaman ini; (b) Mengemas kini tarikh 'Dikemas Kini Terakhir'; (c) Menghantar notifikasi emel kepada anda (untuk perubahan ketara). Kami menggalakkan anda untuk mengkaji dasar ini secara berkala."
      },
      {
        title: "12. Hubungi Kami",
        content: "Jika anda mempunyai sebarang soalan tentang Dasar Privasi ini atau amalan data kami, sila hubungi kami di: Emel: privacy@lingumate.com. Anda juga mempunyai hak untuk mengemukakan aduan kepada pihak berkuasa perlindungan data tempatan anda."
      }
    ]
  },
  ja: {
    title: "プライバシーポリシー",
    lastUpdated: "2026年4月15日",
    sections: [
      {
        title: "1. 収集する情報",
        content: "当社は、お客様から直接提供される情報を収集します：(a) アカウント情報（名前、メールアドレス、パスワード）；(b) プロフィール情報（言語設定、学習目標、習熟度）；(c) 学習コンテンツ（エッセイ、会話記録、リスニング練習の回答、口頭練習の録音）；(d) 使用データ（機能使用状況、使用時間、学習進捗）；(e) 支払い情報（Stripeによって安全に処理され、当社は完全な支払い詳細を保存しません）；(f) デバイス情報（ブラウザタイプ、IPアドレス、デバイス識別子）。"
      },
      {
        title: "2. 情報の使用目的",
        content: "当社はお客様の情報を以下の目的で使用します：(a) サービスの提供、維持、改善；(b) 取引の処理とサブスクリプションの管理；(c) AIを使用したパーソナライズされた学習コンテンツとフィードバックの生成；(d) 技術的通知、サポートメッセージ、セキュリティアラートの送信；(e) コメントや質問への返答；(f) 言語学習機能を改善するための使用パターンの分析；(g) 詐欺、悪用、セキュリティインシデントの検出と防止；(h) 法的義務の遵守。"
      },
      {
        title: "3. データセキュリティ",
        content: "当社はお客様の個人情報を保護するために業界標準のセキュリティ対策を実施しています：(a) TLS/SSL暗号化（HTTPS）を使用したすべてのデータ送信；(b) bcryptを使用したパスワードのハッシュ化（平文での保存はありません）；(c) 保存時のデータベース暗号化；(d) 定期的なセキュリティ監査と脆弱性評価；(e) 必要に応じて認可された担当者のみがアクセス可能；(f) 管理アクセスのための多要素認証；(g) オフサイトストレージによる定期的なバックアップ。ただし、インターネット上の伝送方法は100％安全ではなく、絶対的なセキュリティを保証することはできません。"
      },
      {
        title: "4. データ保持",
        content: "当社は、お客様のアカウントがアクティブである限り、またはお客様にサービスを提供するために必要な限り、お客様の個人情報を保持します。具体的には：(a) アカウントがアクティブな間はアカウントデータを保持；(b) 進捗状況を追跡するために学習コンテンツを保持；(c) アカウント削除後、30日以内に個人情報を削除または匿名化；(d) 匿名化された使用データは、分析とサービス改善のために長期間保持される場合があります；(e) 税法に準拠するために支払い記録を7年間保持。"
      },
      {
        title: "5. 情報の共有",
        content: "当社はお客様の個人情報を第三者に販売、譲渡、賃貸しません。当社は以下の者と情報を共有する場合があります：(a) お客様のデータを保護する契約上の義務を負うサービスプロバイダー（支払い処理のStripe、ホスティングのAWS、電子メールのSendGrid）；(b) 学習コンテンツを生成するためのAIサービスプロバイダー - データは可能な限り匿名化されます；(c) 法律で要求される場合または当社の権利を保護するための法執行機関または規制当局；(d) 合併、買収、または資産売却の場合の承継者。当社はすべての第三者に個人データのセキュリティを尊重し、法律に従って処理することを要求します。"
      },
      {
        title: "6. お客様の権利",
        content: "お客様の所在地に応じて、以下の権利を有する場合があります：(a) アクセス：個人情報のコピーを請求する権利；(b) 訂正：不正確または不完全な情報を訂正する権利；(c) 消去：個人情報の削除を請求する権利；(d) 制限：処理の制限を請求する権利；(e) ポータビリティ：構造化された一般的に使用される形式でデータを受け取る権利；(f) 異議：特定の処理活動に異議を唱える権利；(g) 同意の撤回：撤回前の同意に基づく処理の合法性に影響を与えることなく、いつでも同意を撤回する権利。これらの権利を行使するには、privacy@lingumate.comまでお問い合わせください。"
      },
      {
        title: "7. Cookieとトラッキング",
        content: "当社はCookieおよび類似のトラッキング技術を以下の目的で使用します：(a) ユーザーの認証とセッションの維持；(b) お客様の設定と環境設定を記憶する；(c) サービス使用状況の分析とパフォーマンスの改善；(d) 詐欺の防止とセキュリティの強化。ブラウザの設定でCookieを制御できます。Cookieを無効にすると、サービスの機能に影響を与える可能性があります。"
      },
      {
        title: "8. 国際データ転送",
        content: "お客様の情報は、お客様の国以外の国に転送され、そこで処理される場合があります。これらの国では、お客様の国とは異なるデータ保護法が適用される場合があります。当社は、お客様のデータが適切な保護を受けることを保証するために、標準契約条項を含む適切な保護措置を実施しています。"
      },
      {
        title: "9. 子供のプライバシー",
        content: "当社のサービスは13歳未満のお子様を対象としていません。当社は13歳未満のお子様から意図的に個人情報を収集することはありません。親または保護者であり、お子様が当社に個人情報を提供したと思われる場合は、直ちに当社までご連絡ください。当社はそのような情報を削除する措置を講じます。"
      },
      {
        title: "10. サードパーティリンク",
        content: "当社のサービスには、第三者のウェブサイトまたはサービスへのリンクが含まれる場合があります。当社はこれらの第三者のプライバシー慣行またはコンテンツについて責任を負いません。訪問する第三者のウェブサイトのプライバシーポリシーをお読みになることをお勧めします。"
      },
      {
        title: "11. 本ポリシーの変更",
        content: "当社は随時本プライバシーポリシーを更新する場合があります。重要な変更がある場合は、以下の方法で通知します：(a) このページに新しいポリシーを掲載する；(b) 「最終更新」日付を更新する；(c) 電子メール通知を送信する（重要な変更の場合）。定期的に本ポリシーを確認することをお勧めします。"
      },
      {
        title: "12. お問い合わせ",
        content: "本プライバシーポリシーまたは当社のデータ慣行についてご質問がある場合は、privacy@lingumate.comまでお問い合わせください。お客様には、お住まいの地域のデータ保護当局に苦情を申し立てる権利もあります。"
      }
    ]
  },
  ko: {
    title: "개인정보 처리방침",
    lastUpdated: "2026년 4월 15일",
    sections: [
      {
        title: "1. 수집하는 정보",
        content: "당사는 귀하가 당사에 직접 제공하는 정보를 수집합니다: (a) 계정 정보(이름, 이메일 주소, 비밀번호); (b) 프로필 정보(언어 기본 설정, 학습 목표, 숙련도); (c) 학습 콘텐츠(에세이, 대화 기록, 듣기 연습 답변, 말하기 연습 녹음); (d) 사용 데이터(기능 사용, 소요 시간, 학습 진행 상황); (e) 결제 정보(Stripe에 의해 안전하게 처리되며, 당사는 전체 결제 세부 정보를 저장하지 않습니다); (f) 기기 정보(브라우저 유형, IP 주소, 기기 식별자)."
      },
      {
        title: "2. 정보 사용 목적",
        content: "당사는 귀하의 정보를 다음과 같은 목적으로 사용합니다: (a) 서비스 제공, 유지 및 개선; (b) 거래 처리 및 구독 관리; (c) AI를 사용한 개인화된 학습 콘텐츠 및 피드백 생성; (d) 기술 공지, 지원 메시지 및 보안 경고 발송; (e) 귀하의 의견 및 질문에 대한 응답; (f) 언어 학습 기능 개선을 위한 사용 패턴 분석; (g) 사기, 남용 및 보안 사고 탐지 및 방지; (h) 법적 의무 준수."
      },
      {
        title: "3. 데이터 보안",
        content: "당사는 귀하의 개인정보를 보호하기 위해 업계 표준 보안 조치를 구현합니다: (a) TLS/SSL 암호화(HTTPS)를 사용한 모든 데이터 전송; (b) bcrypt를 사용한 비밀번호 해싱(일반 텍스트로 저장되지 않음); (c) 저장 시 데이터베이스 암호화; (d) 정기적인 보안 감사 및 취약성 평가; (e) 권한이 있는 담당자만 필요 시 접근 가능; (f) 관리 액세스를 위한 다단계 인증; (g) 오프사이트 스토리지를 통한 정기적인 백업. 그러나 인터넷을 통한 전송 방법은 100% 안전하지 않으며, 당사는 절대적인 보안을 보장할 수 없습니다."
      },
      {
        title: "4. 데이터 보관",
        content: "당사는 귀하의 계정이 활성 상태이거나 귀하에게 서비스를 제공하는 데 필요한 기간 동안 귀하의 개인정보를 보관합니다. 구체적으로: (a) 계정이 활성 상태인 동안 계정 데이터 보관; (b) 진행 상황을 추적하기 위해 학습 콘텐츠 보관; (c) 계정 삭제 후 30일 이내에 개인정보 삭제 또는 익명화; (d) 분석 및 서비스 개선을 위해 익명화된 사용 데이터를 더 오래 보관할 수 있음; (e) 세법 준수를 위해 결제 기록을 7년간 보관."
      },
      {
        title: "5. 정보 공유",
        content: "당사는 귀하의 개인정보를 제3자에게 판매, 거래 또는 임대하지 않습니다. 당사는 다음과 같은 자와 정보를 공유할 수 있습니다: (a) 귀하의 데이터를 보호할 계약상 의무가 있는 서비스 제공자(결제 처리를 위한 Stripe, 호스팅을 위한 AWS, 이메일을 위한 SendGrid); (b) 학습 콘텐츠 생성을 위한 AI 서비스 제공자 - 가능한 경우 데이터는 익명화됩니다; (c) 법률이 요구하거나 당사의 권리를 보호하기 위한 법 집행 기관 또는 규제 당국; (d) 합병, 인수 또는 자산 매각 시 승계자. 당사는 모든 제3자가 귀하의 개인 데이터의 보안을 존중하고 법률에 따라 처리할 것을 요구합니다."
      },
      {
        title: "6. 귀하의 권리",
        content: "귀하의 위치에 따라 다음과 같은 권리를 가질 수 있습니다: (a) 접근: 귀하의 개인정보 사본 요청; (b) 정정: 부정확하거나 불완전한 정보 정정; (c) 삭제: 귀하의 개인정보 삭제 요청; (d) 제한: 처리 제한 요청; (e) 이전: 구조화된 일반적으로 사용되는 형식으로 데이터 수신; (f) 이의 제기: 특정 처리 활동에 대한 이의 제기; (g) 동의 철회: 철회 전 동의에 기반한 처리의 적법성에 영향을 주지 않고 언제든지 동의 철회. 이러한 권리를 행사하려면 privacy@lingumate.com으로 연락하십시오."
      },
      {
        title: "7. 쿠키 및 추적",
        content: "당사는 쿠키 및 유사한 추적 기술을 다음 목적으로 사용합니다: (a) 사용자 인증 및 세션 유지; (b) 귀하의 기본 설정 및 설정 기억; (c) 서비스 사용 분석 및 성능 개선; (d) 사기 방지 및 보안 강화. 브라우저 설정을 통해 쿠키를 제어할 수 있습니다. 쿠키를 비활성화하면 서비스 기능에 영향을 미칠 수 있습니다."
      },
      {
        title: "8. 국제 데이터 전송",
        content: "귀하의 정보는 귀하의 국가 이외의 국가로 전송되어 처리될 수 있습니다. 이러한 국가는 귀하의 국가와 다른 데이터 보호 법률을 가질 수 있습니다. 당사는 귀하의 데이터가 적절한 보호를 받도록 보장하기 위해 표준 계약 조항을 포함한 적절한 보호 조치를 구현합니다."
      },
      {
        title: "9. 어린이 개인정보",
        content: "당사의 서비스는 13세 미만의 어린이를 대상으로 하지 않습니다. 당사는 13세 미만의 어린이로부터 의도적으로 개인정보를 수집하지 않습니다. 부모 또는 보호자이며 자녀가 당사에 개인정보를 제공했다고 생각되면 즉시 당사에 연락하십시오. 당사는 해당 정보를 삭제하기 위한 조치를 취할 것입니다."
      },
      {
        title: "10. 제3자 링크",
        content: "당사의 서비스는 제3자 웹사이트 또는 서비스에 대한 링크를 포함할 수 있습니다. 당사는 이러한 제3자의 개인정보 처리방식이나 콘텐츠에 대해 책임을 지지 않습니다. 방문하는 제3자 웹사이트의 개인정보 처리방침을 읽어보시기 바랍니다."
      },
      {
        title: "11. 본 정책의 변경",
        content: "당사는 수시로 본 개인정보 처리방침을 업데이트할 수 있습니다. 당사는 중요한 변경 사항이 있는 경우 다음과 같이 통지합니다: (a) 이 페이지에 새 정책 게시; (b) '최종 업데이트' 날짜 업데이트; (c) 이메일 알림 발송(중요한 변경 사항의 경우). 정기적으로 본 정책을 검토하시기 바랍니다."
      },
      {
        title: "12. 문의처",
        content: "본 개인정보 처리방침 또는 당사의 데이터 관행에 대해 질문이 있으시면 privacy@lingumate.com으로 연락해 주십시오. 귀하는 또한 현지 데이터 보호 당국에 불만을 제기할 권리가 있습니다."
      }
    ]
  }
};

export function TermsOfService({ language = 'en' }) {
  const data = termsContent[language] || termsContent.en;
  
  return (
    <Card className="p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: {data.lastUpdated}</p>
      <div className="space-y-6">
        {data.sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PrivacyPolicy({ language = 'en' }) {
  const data = privacyContent[language] || privacyContent.en;
  
  return (
    <Card className="p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: {data.lastUpdated}</p>
      <div className="space-y-6">
        {data.sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}