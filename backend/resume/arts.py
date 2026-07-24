def calculate_ats(data):

    score = 0

    if data["name"] != "Not Found":
        score += 20

    if data["email"]:
        score += 20

    if data["phone"]:
        score += 20

    if len(data["skills"]) >= 3:
        score += 20

    if len(data["education"]) >= 1:
        score += 20

    return score