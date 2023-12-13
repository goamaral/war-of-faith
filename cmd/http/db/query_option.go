package db

import sq "github.com/Masterminds/squirrel"

type QueryOption sq.Sqlizer

type OrderQueryOption struct {
	Column string
	Desc   bool
}

func (o OrderQueryOption) ToSql() (string, []any, error) {
	if o.Desc {
		return o.Column + " DESC", nil, nil
	}
	return o.Column + " ASC", nil, nil
}

func InnerJoinQueryOption(table, condition string) QueryOption {
	return joinQueryOption{
		Type:      "INNER",
		Table:     table,
		Condition: condition,
	}
}

type joinQueryOption struct {
	Type      string
	Table     string
	Condition string
}

func (o joinQueryOption) ToSql() (string, []any, error) {
	return o.Type + " JOIN " + o.Table + " ON " + o.Condition, nil, nil
}
