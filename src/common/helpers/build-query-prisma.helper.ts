export const buildQueryPrismaHelper = (req) => {
  //xử lý phân trang
  let { page, pageSize, filters } = req.query;
  console.log(page, pageSize);

  const pageDefault = 1;
  const pageSizeDefault = 3;

  //xử lý chuyển về số nguyên
  page = Number(page) || pageDefault;
  pageSize = Number(pageSize) || pageSizeDefault;

  //xử lý trường hợp số âm
  if (page < 1) page = pageDefault;
  if (pageSize < 1) pageSize = pageSizeDefault;

  //index: vị trí bắt đầu lấy dữ liệu
  const index = (page - 1) * pageSize;

  //xử lý filters chuểyn đổi từ JSON sang object, nếu không có thì gán mặc định là object rỗng
  try {
    filters = JSON.parse(filters);
  } catch (err) {
    filters = {};
  }
  //{content: "Nextjs"} -> { content: { contains: "Nextjs" } }
  console.log({ page, pageSize, index, filters });

  //xử lý filter -> {contains: "Nextjs"}
  //[[ 'content', 'nodejs' ]] -> { content: { contains: 'nodejs' } }
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string") {
      filters[key] = {
        contains: value,
      };
    }
  });
  const where = {
    ...filters,
    isDeleted: false, //thêm điều kiện isDeleted = false để chỉ lấy những bài viết chưa bị xóa
  };

  return { page, pageSize, index, where };
};
