import React, { useEffect, useState, useCallback } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { getBlogPosts, BlogPostItem } from "@/services/blog.api";

const TAG_ALL = "Tất cả";

const MOCK_BLOGS: BlogPostItem[] = [
  {
    id: 1,
    title: "Hướng dẫn sử dụng Paracetamol đúng cách & an toàn cho trẻ nhỏ",
    slug: "huong-dan-paracetamol-an-toan",
    excerpt: "Paracetamol là thuốc hạ sốt giảm đau phổ biến nhưng cần tuân thủ đúng liều lượng theo cân nặng để tránh ảnh hưởng gan.",
    cover_image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    og_image_url: "",
    author_name: "Dược sĩ Ngọc Kim Ngân",
    tags: ["Mẹo sức khỏe", "Thuốc OTC"],
    reading_time_minutes: 4,
    view_count: 1250,
    published_at: "2026-07-28T08:00:00Z",
    created_at: "2026-07-28T08:00:00Z",
  },
  {
    id: 2,
    title: "Top 5 Vitamin & Khoáng chất giúp tăng cường sức đề kháng mùa dịch",
    slug: "top-5-vitamin-tang-de-khang",
    excerpt: "Bổ sung Vitamin C, D3, Kẽm đúng cách giúp hệ miễn dịch khỏe mạnh, phòng ngừa các bệnh đường hô hấp hiệu quả.",
    cover_image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80",
    og_image_url: "",
    author_name: "Dược sĩ Chuyên khoa I",
    tags: ["Vitamin", "TPCN"],
    reading_time_minutes: 5,
    view_count: 980,
    published_at: "2026-07-25T10:30:00Z",
    created_at: "2026-07-25T10:30:00Z",
  },
  {
    id: 3,
    title: "Bệnh dạ dày & Các lưu ý quan trọng khi chọn mua Men tiêu hóa",
    slug: "benh-da-day-va-men-tieu-hoa",
    excerpt: "Phân biệt men vi sinh và men tiêu hóa giúp bạn cải thiện tình trạng đầy hơi, khó tiêu một cách khoa học.",
    cover_image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80",
    og_image_url: "",
    author_name: "Nhà thuốc Ngọc Kim Ngân",
    tags: ["Tiêu hóa", "Chăm sóc"],
    reading_time_minutes: 3,
    view_count: 1540,
    published_at: "2026-07-20T14:15:00Z",
    created_at: "2026-07-20T14:15:00Z",
  },
];

function BlogCard({ post, onClick }: { post: BlogPostItem; onClick: () => void }) {
  const date = post.published_at || post.created_at;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" })
    : "";

  return (
    <Box
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
    >
      <Box style={{ height: 110, background: "#f8fafc", position: "relative", overflow: "hidden" }}>
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Box flex alignItems="center" justifyContent="center" style={{ width: "100%", height: "100%", background: "#ecfdf5" }}>
            <Text style={{ fontSize: 36 }}>📰</Text>
          </Box>
        )}
        <Box
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(13, 148, 136, 0.9)",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {post.reading_time_minutes || 3} phút đọc
        </Box>
      </Box>

      <Box style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.35,
            }}
          >
            {post.title}
          </Text>
          {post.excerpt && (
            <Text
              style={{
                fontSize: 11,
                color: "#64748b",
                marginBottom: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
              }}
            >
              {post.excerpt}
            </Text>
          )}
        </Box>

        <Box flex justifyContent="space-between" alignItems="center" style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #f8fafc" }}>
          <Text style={{ fontSize: 10, color: "#94a3b8" }}>{formattedDate}</Text>
          <Text style={{ fontSize: 10, color: "#0d9488", fontWeight: 700 }}>{post.author_name || "Dược sĩ"}</Text>
        </Box>
      </Box>
    </Box>
  );
}

export default function BlogPage() {
  const nav = useNavigate();
  const [posts, setPosts] = useState<BlogPostItem[]>(MOCK_BLOGS);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(TAG_ALL);
  const [tags, setTags] = useState<string[]>([TAG_ALL, "Thuốc OTC", "Vitamin", "Mẹo sức khỏe", "TPCN"]);

  const fetchPosts = useCallback(async (tag: string) => {
    setLoading(true);
    try {
      const params: any = { page: 1, page_size: 12 };
      if (tag !== TAG_ALL) params.tag = tag;
      const data = await getBlogPosts(params);
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        setPosts(data.results);
      } else {
        setPosts(MOCK_BLOGS);
      }
    } catch {
      setPosts(MOCK_BLOGS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(selectedTag);
  }, [selectedTag]);

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Header Banner (Teal Theme) */}
      <Box
        style={{
          paddingTop: 50,
          paddingRight: 16,
          paddingBottom: 20,
          paddingLeft: 16,
          background: "linear-gradient(180deg, #064e3b 0%, #0d9488 100%)",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Box flex alignItems="center" style={{ gap: 12 }}>
          <Box
            onClick={() => nav("/")}
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
          <Box>
            <Text style={{ color: "white", fontSize: 18, fontWeight: 800 }}>Tin tức & Cẩm nang Y tế</Text>
            <Text style={{ color: "#e2e8f0", fontSize: 11, marginTop: 1 }}>
              Kiến thức dược phẩm, góc tư vấn sức khỏe từ Dược sĩ GPP
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Tag Filter Chips */}
      <Box style={{ padding: "14px 16px 4px 16px", display: "flex", gap: 8, overflowX: "auto" }} className="no-scrollbar">
        {tags.map((tag) => (
          <Box
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: selectedTag === tag ? "#0d9488" : "white",
              color: selectedTag === tag ? "white" : "#475569",
              border: selectedTag === tag ? "none" : "1px solid #e2e8f0",
              boxShadow: selectedTag === tag ? "0 2px 6px rgba(13,148,136,0.3)" : "none",
              cursor: "pointer",
            }}
          >
            {tag}
          </Box>
        ))}
      </Box>

      {/* Featured First Article Hero */}
      {posts.length > 0 && (
        <Box style={{ padding: "8px 16px" }}>
          <Box
            onClick={() => nav(`/blog/${posts[0].slug}`)}
            style={{
              background: "white",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #f1f5f9",
              cursor: "pointer",
            }}
          >
            <Box style={{ height: 160, position: "relative", overflow: "hidden" }}>
              <img src={posts[0].cover_image} alt={posts[0].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Box
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  background: "#ee4d2d",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 12,
                }}
              >
                🔥 NỔI BẬT KHUYÊN ĐỌC
              </Box>
            </Box>

            <Box style={{ padding: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 6, lineHeight: 1.35 }}>
                {posts[0].title}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }} className="line-clamp-2">
                {posts[0].excerpt}
              </Text>
              <Box flex justifyContent="space-between" alignItems="center" style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 11, color: "#0d9488", fontWeight: 700 }}>{posts[0].author_name}</Text>
                <Text style={{ fontSize: 11, color: "#94a3b8" }}>{posts[0].reading_time_minutes} phút đọc</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Remaining Blog Grid */}
      <Box style={{ padding: "8px 16px 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {posts.slice(1).map((post) => (
          <BlogCard key={post.id} post={post} onClick={() => nav(`/blog/${post.slug}`)} />
        ))}
      </Box>
    </Box>
  );
}
