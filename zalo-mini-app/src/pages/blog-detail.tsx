import React, { useEffect, useState } from "react";
import { Box, Text, Icon, useNavigate, useParams } from "zmp-ui";
import { getBlogPost, getLatestPosts, recordView, BlogPostDetail, BlogPostItem } from "@/services/blog.api";
import "@/css/blog-content.css";

const MOCK_DETAIL: BlogPostDetail = {
  id: 1,
  title: "Hướng dẫn sử dụng Paracetamol đúng cách & an toàn cho trẻ nhỏ",
  slug: "huong-dan-paracetamol-an-toan",
  excerpt: "Paracetamol là thuốc hạ sốt giảm đau phổ biến nhưng cần tuân thủ đúng liều lượng theo cân nặng để tránh ảnh hưởng gan.",
  content: `
    <h3>1. Liều dùng Paracetamol khuyến cáo cho trẻ em</h3>
    <p>Liều khuyến cáo thông thường của Paracetamol cho trẻ em là <strong>10 - 15mg/kg cân nặng/lần</strong>. Khoảng cách giữa các lần uống là từ <strong>4 - 6 giờ</strong>, không dùng quá 4 lần trong 24 giờ.</p>
    <div className="warning-callout">
      <p>⚠️ <strong>Lưu ý quan trọng:</strong> Tuyệt đối không tự ý cho trẻ uống quá 60mg/kg/ngày mà không có sự chỉ định của Bác sĩ hoặc Dược sĩ chuyên môn.</p>
    </div>
    <h3>2. Dạng bào chế phù hợp theo độ tuổi</h3>
    <ul>
      <li><strong>Gói bột sủi / Cốm pha uống:</strong> Thích hợp cho trẻ từ 1 - 6 tuổi, dễ uống với vị ngọt hoa quả.</li>
      <li><strong>Siro hạ sốt:</strong> Phù hợp cho trẻ sơ sinh và trẻ nhỏ dưới 2 tuổi.</li>
      <li><strong>Viên đặt hậu môn:</strong> Dùng khi trẻ bị nôn ói nhiều hoặc không thể uống thuốc.</li>
    </ul>
    <h3>3. Những trường hợp cần đưa trẻ đi cơ sở y tế</h3>
    <p>Nếu trẻ sốt cao trên 39°C không hạ sau khi uống thuốc 1-2 giờ, hoặc sốt kéo dài quá 48 giờ, phụ huynh cần đưa trẻ đến bệnh viện gần nhất để kiểm tra.</p>
  `,
  cover_image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
  og_image_url: "",
  author_name: "Dược sĩ Ngọc Kim Ngân",
  tags: ["Mẹo sức khỏe", "Thuốc OTC"],
  reading_time_minutes: 4,
  view_count: 1250,
  published_at: "2026-07-28T08:00:00Z",
  created_at: "2026-07-28T08:00:00Z",
  seo_title: "Hướng dẫn sử dụng Paracetamol an toàn cho trẻ em | Nhà thuốc Ngọc Kim Ngân",
  seo_description: "Hướng dẫn tính liều Paracetamol cho bé chuẩn y khoa.",
  updated_at: "2026-07-28T08:00:00Z",
};

export default function BlogDetailPage() {
  const nav = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(MOCK_DETAIL);
  const [related, setRelated] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      getBlogPost(slug).catch(() => null),
      getLatestPosts(5).catch(() => []),
    ]).then(([detail, latest]) => {
      if (detail) {
        setPost(detail);
      } else {
        setPost(MOCK_DETAIL);
      }
      setRelated(latest.filter((p) => p.slug !== slug).slice(0, 4));
      setLoading(false);
      recordView(slug);
    });
  }, [slug]);

  if (!post) return null;

  const date = post.published_at || post.created_at;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Header Banner (Teal Theme) */}
      <Box
        style={{
          paddingTop: 50,
          paddingRight: 16,
          paddingBottom: 16,
          paddingLeft: 16,
          background: "linear-gradient(180deg, #064e3b 0%, #0d9488 100%)",
        }}
      >
        <Box flex justifyContent="space-between" alignItems="center">
          <Box flex alignItems="center" style={{ gap: 10 }}>
            <Box
              onClick={() => nav("/blog")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Icon icon="zi-chevron-left" style={{ color: "white" }} size={20} />
            </Box>
            <Text style={{ color: "white", fontSize: 16, fontWeight: 800 }}>Chi tiết bài viết</Text>
          </Box>

          <Box
            onClick={() => alert(`Đã chia sẻ bài viết: ${post.title}`)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon icon="zi-share" style={{ color: "white" }} size={18} />
          </Box>
        </Box>
      </Box>

      {/* Cover Image Banner */}
      {post.cover_image && (
        <Box style={{ width: "100%", maxHeight: 220, overflow: "hidden" }}>
          <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
      )}

      {/* Article Content Container */}
      <Box style={{ padding: "16px 16px" }}>
        <Box style={{ background: "white", borderRadius: 18, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {/* Article Title */}
          <Text style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, marginBottom: 10 }}>
            {post.seo_title || post.title}
          </Text>

          {/* Author & Meta Row */}
          <Box flex alignItems="center" style={{ gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <Box
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                background: "#ecfdf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0d9488",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              💊
            </Box>
            <Text style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>{post.author_name}</Text>
            <Text style={{ fontSize: 12, color: "#cbd5e1" }}>•</Text>
            <Text style={{ fontSize: 11, color: "#64748b" }}>{formattedDate}</Text>
            <Text style={{ fontSize: 12, color: "#cbd5e1" }}>•</Text>
            <Text style={{ fontSize: 11, color: "#0d9488", fontWeight: 700 }}>{post.reading_time_minutes} phút đọc</Text>
          </Box>

          {/* Tags list */}
          {post.tags && post.tags.length > 0 && (
            <Box flex style={{ gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <Box
                  key={tag}
                  style={{
                    padding: "3px 10px",
                    background: "#ecfdf5",
                    color: "#059669",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 12,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  #{tag}
                </Box>
              ))}
            </Box>
          )}

          {/* Article HTML Content */}
          <Box
            className="blog-content"
            style={{ paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Pharmacist Author Card */}
          <Box
            style={{
              marginTop: 16,
              background: "#f8fafc",
              borderRadius: 14,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #f1f5f9",
            }}
          >
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: "#0d9488",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              💊
            </Box>
            <Box style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{post.author_name}</Text>
              <Text style={{ fontSize: 11, color: "#64748b" }}>Cố vấn chuyên môn • Nhà thuốc Ngọc Kim Ngân</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
