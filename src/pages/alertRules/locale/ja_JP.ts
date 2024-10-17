const ja_JP = {
  title: "アラートルール",
  search_placeholder: "名前またはタグを検索",
  prod: "監視タイプ",
  severity: "レベル",
  notify_groups: "アラート受信グループ",
  basic_configs: "基本設定",
  name: "ルール名",
  name_severities_appendtags: "名前 & レベル & 追加タグ",
  append_tags: "追加タグ",
  append_tags_msg: "タグの形式が間違っています。確認してください！",
  append_tags_msg1: "タグの長さは64文字以下でなければなりません",
  append_tags_msg2:
    "タグの形式は key=value でなければなりません。key はアルファベットまたはアンダースコアで始まり、アルファベット、数字、アンダースコアで構成されます。",
  append_tags_placeholder:
    "タグの形式は key=value で、回車または空白で区切ってください",
  group_id: "ビジネスグループ",
  note: "備考",
  append_tags_note_tip:
    "このルールによって生成されるすべてのアラートイベントに追加され、将来これらのタグを使用してイベントをフィルタリングできます",
  rule_configs: "ルール設定",
  inhibit: "レベル抑制",
  inhibit_tip:
    "metricName と labels が完全に同じ曲線によって生成されたアラートイベントのみがレベル抑制の対象となり、1級>2級>3級の順序で抑制されます",
  interval: "実行頻度",
  duration: "継続時間",
  severity_label: "アラートをトリガー",
  prom_eval_interval: "実行頻度 (s)",
  prom_for_duration: "継続時間 (s)",
  effective_configs: "有効設定",
  enable_status: "即時有効",
  effective_time: "有効時間",
  effective_time_start: "開始時間",
  effective_time_start_msg: "開始時間は空できません",
  effective_time_end: "終了時間",
  effective_time_end_msg: "終了時間は空できません",
  effective_time_week_msg: "有効期間を選択してください",
  enable_in_bg: "このビジネスグループでのみ有効",
  enable_in_bg_tip: "アラートイベントのident帰属関係に基づいて判断",
  notify_configs: "通知設定",
  notify_channels: "通知メディア",
  notify_channels_doc: "ドキュメントを使用",
  notify_channels_tpl: "通知メディアテンプレート",
  notify_channels_tpl_tip: "空の場合はデフォルトテンプレートを使用",
  notify_recovered: "復旧通知を有効",
  notify_recovered_tip: "アラートが復旧したときも通知を送信",
  recover_duration: "監視時間（秒）",
  recover_duration_tip:
    "{{num}}秒間アラートが再度トリガーされない場合、復旧通知を送信",
  notify_repeat_step: "繰り返し通知間隔（分）",
  notify_repeat_step_tip:
    "アラートが継続して復旧しない場合、{{num}}分間隔で繰り返し通知を送信",
  notify_max_number: "最大送信回数",
  notify_max_number_tip: "値が0の場合は最大送信回数の制限を設けません",
  notify_flashduty_configured:
    "現在、全局 Flashduty プッシュが設定されています",
  callbacks: "コールバックURL",
  annotations: "追加情報",
  annotationsOptions: {
    plan_link: "計画リンク",
    dashboard_link: "ダッシュボードリンク",
    desc: "説明",
  },
  extra_config: {
    default_tpl: "デフォルトテンプレート",
  },
  invalid_datasource_tip_1: "データソース",
  invalid_datasource_tip_2:
    "関連するアラートエンジンクラスタが設定されていません",
  invalid_datasource_reload: "データソースをリロード",
  host: {
    query: {
      title: "ホストフィルタ",
      key: {
        all_hosts: "すべてのホスト",
        datasource_ids: "データソース",
        group_ids: "ビジネスグループ",
        tags: "タグ",
        hosts: "ホスト識別",
      },
      preview: "ホストプレビュー",
    },
    trigger: {
      title: "アラート条件",
      key: {
        target_miss: "ホストの接続失敗",
        pct_target_miss: "ホストクラスタの接続失敗",
        offset: "ホストの時間偏移",
      },
      than: "を超えた",
      pct_target_miss_text: "秒、接続失敗率が",
      second: "秒",
      millisecond: "ミリ秒",
    },
    prom_eval_interval_tip:
      "promql 実行頻度、{{num}}秒ごとに時系列データベースをクエリし、結果を時系列データベースに書き換え",
    prom_for_duration_tip:
      "通常、継続時間は実行頻度よりも大きく、継続時間内で実行頻率に従ってPromQLクエリを複数回実行し、各クエリがトリガーを発生させる場合にのみアラートを生成します。継続時間を0に設定すると、PromQLクエリが一度でもトリガーを発生させる場合、アラートを生成します",
  },
  metric: {
    query: {
      title: "アラート条件",
    },
    prom_eval_interval_tip:
      "promql 実行頻度、{{num}}秒ごとに時系列データベースをクエリし、結果を時系列データベースに書き換え",
    prom_for_duration_tip:
      "通常、継続時間は実行頻度よりも大きく、継続時間内で実行頻度に従ってPromQLクエリを複数回実行し、各クエリがトリガーを発生させる場合にのみアラートを生成します。継続時間を0に設定すると、PromQLクエリが一度でもトリガーを発生させる場合、アラートを生成します",
  },
  loki: {
    required: "LogQLを入力してください",
  },
  batch: {
    not_select: "まず、戦略を選択してください",
    delete: "アラートルールを削除",
    delete_confirm: "選択したアラートルールを削除してよろしいですか？",
    delete_success: "削除に成功しました",
    import: {
      title: "アラートルールをインポート",
      name: "アラートルール",
      result: "インポート結果",
      errmsg: "エラー情報",
    },
    import_builtin: "内蔵アラートルールをインポート",
    import_prometheus: "Prometheus アラートルールをインポート",
    export: {
      title: "アラートルールをエクスポート",
      copy: "JSONコンテンツをクリップボードにコピー",
    },
    update: {
      title: "アラートルールを更新",
      name: "バッチ更新",
      field: "フィールド",
      changeto: "変更する",
      enable_in_bg_tip: "アラートイベントのident帰属関係に基づいて判断",
      callback_cover: {
        mode: "モード",
        cover: "カバー",
        callback_add: "追加",
        callback_del: "削除",
      },
      effective_time_msg: "有効時間は空できません",
      effective_time_add: "有効時間を追加",
      options: {
        datasource_ids: "データソース",
        severity: "アラートレベル",
        prom_eval_interval: "実行頻度",
        prom_for_duration: "継続時間",
        disabled: "有効",
        effective_time: "有効時間",
        enable_in_bg: "このビジネスグループでのみ有効",
        append_tags: "追加タグ",
        notify_channels: "通知メディア",
        notify_groups: "アラート受信グループ",
        notify_recovered: "復旧通知を有効",
        notify_repeat_step: "繰り返し通知間隔",
        recover_duration: "監視時間",
        notify_max_number: "最大送信回数",
        callbacks: "コールバックURL",
        note: "備考",
        runbook_url: "計画リンク",
        service_cal_ids: "サービスカレンダー",
        annotations: "追加情報",
        triggers: "アラート条件",
      },
    },
    cloneToHosts: {
      title: "複数のホストにクローン",
      select_hosts: {
        title: "ホストを選択",
        filter: "フィルタ",
        ident: "ホスト識別",
        tags: "タグ",
        group: "ビジネスグループ",
      },
      clone_btn: "クローン",
      result: {
        title: "クローン結果",
        host: "ホスト",
        rule: "ルール",
        msg: "結果",
      },
    },
  },
  brain_result_btn: "トレーニング結果",
  testTip:
    "\n  ルールの有効性チェック、以下のチェック項目を含む：<br />\n  1. ユーザの連絡先の有効性チェック\n  ",
  default_filter: {
    title: "プリセットフィルタ",
    all: "すべてのルール",
  },
  ruleConfigPromVersion: "ルールモード",
  ruleConfigPromVersion_v1: "通常モード",
  ruleConfigPromVersion_v2: "高度なモード",
  ruleConfigPromVersion_tip:
    "通常モード：PromQLでアラートの閾値、クエリ条件、および閾値設定を構成します。特別な要件がない場合は、通常モードを使用してください。<br />高度なモード：クエリ条件と閾値設定を分けて構成します。複数のクエリ条件に対して加減乗除の計算が必要な場合は、高度なモードを使用します。アラートイベントの現場値には、各クエリ条件の値が表示されます。",
  ruleConfigPromVersionV2: {
    query: {
      title: "クエリ条件",
    },
  },
  preview: "データプレビュー",
  table: {
    group_id: "ビジネスグループ",
    cate: "タイプ",
    datasource_ids: "データソース",
    name: "名前",
    append_tags: "追加タグ",
    notify_groups_obj: "アラート受信グループ",
    update_at: "更新時間",
    update_by: "更新者",
    disabled: "有効",
    severity: "レベル",
  },
  expired:
    "アラートルールが他のユーザによって変更されました。相互に上書きされることを避けるために、ページを更新して最新の構成を確認してください。",
  relabel: {
    title: "イベント relabel",
    help_btn: "使用説明",
    if_tip: "選択可能、この一致条件を満たすイベントのみラベルを relabel します",
    target_label_tip: "新しいラベルのキー",
    replacement_tip:
      "ラベルの最終的な値。セパレータを構成した場合、このフィールドは空白にできます。正規表現を構成した場合、このフィールドには正規表現で一致した内容を使用して最終的な目標値を構築できます",
    source_labels_tip: "選択可能、使用する元のラベル",
    source_labels_tip_placeholder: "改行かスペースで区切る",
    separator_tip:
      "選択可能、既存のラベル値に基づいて連結する。値の連結に使用する連結文字",
    regex_tip:
      "選択可能、既存のラベル値の一部の内容に基づいて構築する。抽出構築内容の正規表現",
    labelkeep: {
      regex_tip:
        "必須、正規表現をサポート。ラベルキーに一致したラベルは保持されます",
    },
    labeldrop: {
      regex_tip:
        "必須、正規表現をサポート。ラベルキーに一致したラベルは削除されます",
    },
    labelmap: {
      regex_tip: "必須、正規表現を使用して内容を抽出します",
      replacement_tip:
        "固定値を書くこともできます。例えば、abc。正規表現が local(host) の場合、ここに $1 を書きます。最終的な値は host になります",
    },
    test_btn: "構成をテスト",
    test: {
      title: "テスト",
      label: "ラベル",
      labelFromEvent: "アラートイベントからラベルを選択",
      btn: "テスト",
      result: "relabel の結果",
    },
  },
  task_tpls: {
    title: "アラート自己治癒",
    add_btn: "自己治癒テンプレートを作成",
    tpl_id: "自己治癒テンプレート",
    tpl_id_msg: "自己治癒テンプレートは空にできません",
    host: "実行マシン",
    host_placeholder:
      "デフォルトは空にできます。イベントの ident ラベルから実行するマシンを取得します",
  },
};

export default ja_JP;